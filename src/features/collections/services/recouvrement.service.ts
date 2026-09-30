import { NiveauRelance } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { FactureService } from "@/features/invoices/services/facture.service";
import { RelanceRepository } from "@/features/collections/repositories/relance.repository";
import type { ImpayeDTO } from "@/features/collections/types/collection.types";

const NIVEAU_ORDER: readonly NiveauRelance[] = [
    NiveauRelance.NIVEAU_1,
    NiveauRelance.NIVEAU_1_BIS,
    NiveauRelance.NIVEAU_2,
    NiveauRelance.NIVEAU_3,
];

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

async function listImpayesCore(organizationId: string): Promise<ImpayeDTO[]> {
    const factures = await FactureService.listImpayesForOrganization(organizationId);
    const echeanceIds = factures.map((facture) => facture.echeanceId);
    const relances = await RelanceRepository.findAllByEcheanceIds(echeanceIds, organizationId);

    const dernierNiveauParEcheance = new Map<string, NiveauRelance>();

    for (const relance of relances) {
        const niveauActuel = dernierNiveauParEcheance.get(relance.echeanceId);

        if (!niveauActuel || NIVEAU_ORDER.indexOf(relance.niveau) > NIVEAU_ORDER.indexOf(niveauActuel)) {
            dernierNiveauParEcheance.set(relance.echeanceId, relance.niveau);
        }
    }

    const now = Date.now();

    const impayes: ImpayeDTO[] = factures.map((facture) => {
        const dateEcheance = new Date(facture.annee, facture.mois - 1, 1);
        const joursRetard = Math.max(0, Math.floor((now - dateEcheance.getTime()) / MILLISECONDS_PER_DAY));

        return {
            ...facture,
            joursRetard,
            dernierNiveauRelance: dernierNiveauParEcheance.get(facture.echeanceId) ?? null,
        };
    });

    return impayes.sort((a, b) => b.joursRetard - a.joursRetard);
}

export class RecouvrementService {
    static async listImpayes(): Promise<ImpayeDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return listImpayesCore(organizationId);
    }

    /**
     * Variante sans dépendance à la session — pour la tâche planifiée de
     * relances automatiques (LOT-17), qui itère sur toutes les organisations.
     */
    static async listImpayesForOrganization(organizationId: string): Promise<ImpayeDTO[]> {
        return listImpayesCore(organizationId);
    }
}
