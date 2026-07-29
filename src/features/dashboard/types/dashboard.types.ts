import type { PrioriteIncident } from "@/generated/prisma/enums";

export type FactureAlerteDTO = Readonly<{
    id: string;
    numero: string;
    totalDu: number;
    dateEcheance: Date;
    locataireNom: string;
    uniteLabel: string;
}>;

export type IncidentAlerteDTO = Readonly<{
    id: string;
    titre: string;
    priorite: PrioriteIncident;
    dateSignalement: Date;
    localisation: string | null;
}>;

export type DashboardMetricsDTO = Readonly<{
    tauxOccupation: number;
    totalUnites: number;
    unitesOccupees: number;
    totalImpayesMoisPrecedent: number;
    nombreFacturesImpayeesMoisPrecedent: number;
    revenuMensuelEncaisse: number;
    facturesImpayeesUrgentes: readonly FactureAlerteDTO[];
    incidentsNonResolus: readonly IncidentAlerteDTO[];
}>;
