import { addMonths, startOfMonth, subMonths } from "date-fns";

import { getCurrentOrganizationId } from "@/lib/auth";
import { DashboardRepository } from "@/features/dashboard/repositories/dashboard.repository";
import type {
    DashboardMetricsDTO,
    FactureAlerteDTO,
    IncidentAlerteDTO,
} from "@/features/dashboard/types/dashboard.types";

const URGENT_LIST_LIMIT = 5;

function formatLocataireNom(locataire: { nom: string; prenom: string; raisonSociale: string | null }): string {
    return locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`;
}

export class DashboardService {
    static async getMetrics(): Promise<DashboardMetricsDTO> {
        const organizationId = await getCurrentOrganizationId();
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const nextMonthStart = startOfMonth(addMonths(now, 1));
        const previousMonthStart = startOfMonth(subMonths(now, 1));

        const [uniteCounts, impayes, revenuMensuelEncaisse, facturesRaw, incidentsRaw] = await Promise.all([
            DashboardRepository.getUniteCounts(organizationId),
            DashboardRepository.getImpayes(organizationId, previousMonthStart, currentMonthStart),
            DashboardRepository.getRevenuEncaisse(organizationId, currentMonthStart, nextMonthStart),
            DashboardRepository.findFacturesImpayeesUrgentes(organizationId, URGENT_LIST_LIMIT),
            DashboardRepository.findIncidentsNonResolus(organizationId, URGENT_LIST_LIMIT),
        ]);

        const tauxOccupation = uniteCounts.total > 0 ? (uniteCounts.occupees / uniteCounts.total) * 100 : 0;

        const facturesImpayeesUrgentes: FactureAlerteDTO[] = facturesRaw.map((facture) => ({
            id: facture.id,
            numero: facture.numero,
            totalDu: facture.totalDu,
            dateEcheance: facture.echeance.dateEcheance,
            locataireNom: formatLocataireNom(facture.echeance.contrat.locataire),
            uniteLabel: `${facture.echeance.contrat.unite.immeuble.nom} — ${facture.echeance.contrat.unite.numero}`,
        }));

        const incidentsNonResolus: IncidentAlerteDTO[] = incidentsRaw.map((incident) => ({
            id: incident.id,
            titre: incident.titre,
            priorite: incident.priorite,
            dateSignalement: incident.dateSignalement,
            localisation: incident.unite
                ? `${incident.unite.immeuble.nom} — ${incident.unite.numero}`
                : (incident.immeuble?.nom ?? null),
        }));

        return {
            tauxOccupation,
            totalUnites: uniteCounts.total,
            unitesOccupees: uniteCounts.occupees,
            totalImpayesMoisPrecedent: impayes.total,
            nombreFacturesImpayeesMoisPrecedent: impayes.count,
            revenuMensuelEncaisse,
            facturesImpayeesUrgentes,
            incidentsNonResolus,
        };
    }
}
