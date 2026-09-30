import type { PrioriteIncident, StatutIncident } from "@/generated/prisma/enums";

export type { UniteOptionDTO } from "@/features/units/types/unit.types";

export type IncidentDTO = Readonly<{
    id: string;
    titre: string;
    description: string;
    priorite: PrioriteIncident;
    statut: StatutIncident;
    prestataire: string | null;
    dateSignalement: Date;
    dateResolution: Date | null;
    unite: Readonly<{
        id: string;
        numero: string;
        immeubleId: string;
        immeuble: Readonly<{ id: string; nom: string }>;
    }> | null;
    immeuble: Readonly<{ id: string; nom: string }> | null;
}>;
