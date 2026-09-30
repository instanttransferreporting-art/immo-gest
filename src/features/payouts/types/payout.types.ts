export type { StatutReversement } from "@/generated/prisma/enums";
import type { StatutReversement } from "@/generated/prisma/enums";

export type ReversementDTO = Readonly<{
    id: string;
    proprietaireId: string;
    mois: number;
    annee: number;
    totalEncaisse: number;
    tauxCommission: number;
    commission: number;
    netAPayer: number;
    statut: StatutReversement;
    dateGeneration: Date;
    dateValidation: Date | null;
    proprietaire: Readonly<{
        id: string;
        nom: string;
        prenom: string | null;
    }>;
}>;
