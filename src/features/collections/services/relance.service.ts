import { NiveauRelance } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { MailService } from "@/lib/mail.service";
import { RelanceRepository } from "@/features/collections/repositories/relance.repository";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { FactureService } from "@/features/invoices/services/facture.service";
import { buildQuittancePdfSafe } from "@/features/invoices/pdf/quittance-pdf-builder";
import type { GenererRelanceFormValues } from "@/features/collections/schemas/collection.schema";
import type { RelanceDTO } from "@/features/collections/types/collection.types";

const NIVEAU_ORDER: readonly NiveauRelance[] = [
    NiveauRelance.NIVEAU_1,
    NiveauRelance.NIVEAU_1_BIS,
    NiveauRelance.NIVEAU_2,
    NiveauRelance.NIVEAU_3,
];

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export class RelanceNiveauOrderError extends Error {
    constructor(niveauRequis: NiveauRelance) {
        super(`Impossible de générer cette relance : le niveau ${niveauRequis} doit être envoyé au préalable.`);
        this.name = "RelanceNiveauOrderError";
    }
}

function envoyerRelanceAsync(
    organizationId: string,
    niveau: NiveauRelance,
    context: NonNullable<Awaited<ReturnType<typeof RelanceRepository.findEcheanceContext>>>
): void {
    void OrganizationService.getById(organizationId).then(async (organization) => {
        if (!organization) {
            return;
        }

        const facture = context.factures[0];

        if (!facture) {
            return;
        }

        const joursRetard = Math.max(
            0,
            Math.floor((Date.now() - context.dateEcheance.getTime()) / MILLISECONDS_PER_DAY)
        );

        // Facture en pièce jointe à partir du 2e rappel (Niveau 1 BIS), une fois
        // la pénalité éventuellement appliquée sur la facture.
        const attachment =
            niveau !== NiveauRelance.NIVEAU_1
                ? await buildAttachmentForFacture(organizationId, organization.nom, organization.adresse, facture.id)
                : undefined;

        await MailService.sendRelance({
            to: context.contrat.locataire.email,
            organizationNom: organization.nom,
            organizationLogo: organization.logo,
            locataireNom: context.contrat.locataire.raisonSociale ??
                `${context.contrat.locataire.nom} ${context.contrat.locataire.prenom}`,
            uniteLabel: `${context.contrat.unite.immeuble.nom} — ${context.contrat.unite.numero}`,
            numeroFacture: facture.numero,
            soldeRestant: context.soldeRestant,
            joursRetard,
            niveau,
            attachment,
        });
    });
}

async function buildAttachmentForFacture(
    organizationId: string,
    organizationNom: string,
    organizationAdresse: string | null,
    factureId: string
) {
    const facture = await FactureService.getByIdForOrganization(factureId, organizationId);

    if (!facture) {
        return undefined;
    }

    return buildQuittancePdfSafe({
        organizationNom,
        organizationAdresse,
        facture,
        totalEncaisse: facture.totalDu - facture.soldeRestant,
    });
}

async function appliquerPenaliteSiApplicable(organizationId: string, echeanceId: string): Promise<void> {
    const context = await RelanceRepository.findEcheanceContext(echeanceId, organizationId);
    const facture = context?.factures[0];

    if (!facture) {
        return;
    }

    const organization = await OrganizationService.getById(organizationId);

    if (!organization || organization.tauxPenaliteRetard <= 0) {
        return;
    }

    const montantPenalite = Math.round((facture.totalDu * organization.tauxPenaliteRetard) / 100);

    if (montantPenalite <= 0) {
        return;
    }

    await FactureService.appliquerPenalite(facture.id, echeanceId, organizationId, montantPenalite);
}

async function genererRelanceCore(organizationId: string, input: GenererRelanceFormValues): Promise<RelanceDTO> {
    const niveauIndex = NIVEAU_ORDER.indexOf(input.niveau);

    if (niveauIndex > 0) {
        const niveauRequis = NIVEAU_ORDER[niveauIndex - 1];
        const existantes = await RelanceRepository.findAllByEcheance(input.echeanceId, organizationId);
        const aEteEnvoyee = existantes.some((relance) => relance.niveau === niveauRequis);

        if (!aEteEnvoyee) {
            throw new RelanceNiveauOrderError(niveauRequis);
        }
    }

    const relance = await RelanceRepository.create(organizationId, {
        echeanceId: input.echeanceId,
        niveau: input.niveau,
        details: input.details,
    });

    if (input.niveau === NiveauRelance.NIVEAU_1_BIS) {
        await appliquerPenaliteSiApplicable(organizationId, input.echeanceId);
    }

    const context = await RelanceRepository.findEcheanceContext(input.echeanceId, organizationId);

    if (context) {
        envoyerRelanceAsync(organizationId, input.niveau, context);
    }

    return relance;
}

export class RelanceService {
    static async genererRelance(input: GenererRelanceFormValues): Promise<RelanceDTO> {
        const organizationId = await getCurrentOrganizationId();
        return genererRelanceCore(organizationId, input);
    }

    /**
     * Variante sans dépendance à la session — pour la tâche planifiée de
     * relances automatiques (LOT-17), qui itère sur toutes les organisations.
     */
    static async genererRelanceForOrganization(
        organizationId: string,
        input: GenererRelanceFormValues
    ): Promise<RelanceDTO> {
        return genererRelanceCore(organizationId, input);
    }
}
