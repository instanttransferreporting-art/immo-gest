import { prisma } from "@/lib/prisma";

import { PaiementRepository } from "@/features/payments/repositories/paiement.repository";
import { FactureNotFoundError, FactureService } from "@/features/invoices/services/facture.service";
import type { PaiementFormValues } from "@/features/payments/schemas/payment.schema";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

export class InsufficientBalanceError extends Error {
    constructor() {
        super("Le montant du paiement dépasse le reste à payer de la facture.");
        this.name = "InsufficientBalanceError";
    }
}

export class PaiementService {
    static async create(input: PaiementFormValues, userId: string): Promise<PaiementDTO> {
        return prisma.$transaction(
            async (tx) => {
                const facture = await FactureService.getById(input.factureId, tx);

                if (!facture) {
                    throw new FactureNotFoundError();
                }

                if (input.montant > facture.soldeRestant) {
                    throw new InsufficientBalanceError();
                }

                const paiement = await PaiementRepository.create(
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
                    facture.soldeRestant,
                    input.montant,
                    tx
                );

                return paiement;
            },
            { maxWait: 10_000, timeout: 15_000 }
        );
    }

    static async listByFacture(factureId: string): Promise<PaiementDTO[]> {
        return PaiementRepository.findByFacture(factureId);
    }
}
