import { getCurrentOrganizationId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MailService } from "@/lib/mail.service";

import { PaiementRepository } from "@/features/payments/repositories/paiement.repository";
import { FactureNotFoundError, FactureService } from "@/features/invoices/services/facture.service";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import type { PaiementFormValues } from "@/features/payments/schemas/payment.schema";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

export class InsufficientBalanceError extends Error {
    constructor() {
        super("Le montant du paiement dépasse le reste à payer de la facture.");
        this.name = "InsufficientBalanceError";
    }
}

function envoyerQuittanceAsync(organizationId: string, facture: FactureDTO, paiement: PaiementDTO): void {
    void OrganizationService.getById(organizationId).then((organization) => {
        if (!organization) {
            return;
        }

        const soldeRestant = Math.max(facture.soldeRestant - paiement.montant, 0);

        return MailService.sendQuittance({
            to: facture.contrat.locataire.email,
            organizationNom: organization.nom,
            organizationLogo: organization.logo,
            locataireNom: facture.contrat.locataire.raisonSociale ??
                `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`,
            uniteLabel: `${facture.contrat.unite.immeuble.nom} — ${facture.contrat.unite.numero}`,
            numeroFacture: facture.numero,
            montantPaye: paiement.montant,
            modePaiement: MODE_PAIEMENT_LABELS[paiement.mode],
            datePaiement: paiement.datePaiement,
            soldeRestant,
        });
    });
}

export class PaiementService {
    static async create(input: PaiementFormValues, userId: string): Promise<PaiementDTO> {
        const organizationId = await getCurrentOrganizationId();

        const { paiement, facture } = await prisma.$transaction(
            async (tx) => {
                const facture = await FactureService.getById(input.factureId, tx);

                if (!facture) {
                    throw new FactureNotFoundError();
                }

                if (input.montant > facture.soldeRestant) {
                    throw new InsufficientBalanceError();
                }

                const paiement = await PaiementRepository.create(
                    organizationId,
                    {
                        factureId: input.factureId,
                        echeanceId: facture.echeanceId,
                        userId,
                        mode: input.mode,
                        montant: input.montant,
                        reference: input.reference,
                    },
                    tx
                );

                await FactureService.registerPayment(
                    input.factureId,
                    facture.echeanceId,
                    organizationId,
                    facture.soldeRestant,
                    input.montant,
                    tx
                );

                return { paiement, facture };
            },
            { maxWait: 10_000, timeout: 15_000 }
        );

        envoyerQuittanceAsync(organizationId, facture, paiement);

        return paiement;
    }

    static async listByFacture(factureId: string): Promise<PaiementDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return PaiementRepository.findByFacture(factureId, organizationId);
    }
}
