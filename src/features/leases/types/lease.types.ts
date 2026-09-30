import type { FrequenceEcheance, FrequencePaiement, StatutBail } from "@/generated/prisma/enums";

export type { LocataireOptionDTO } from "@/features/tenants/types/tenant.types";
export type { UniteLibreOptionDTO } from "@/features/units/types/unit.types";

export type ContratDTO = Readonly<{
    id: string;
    numeroContrat: string;
    uniteId: string;
    locataireId: string;
    dateDebut: Date;
    dateFin: Date;
    loyerBase: number;
    charges: number;
    depotGarantie: number;
    frequence: FrequenceEcheance;
    nombreNuitees: number | null;
    statut: StatutBail;
    motifResiliation: string | null;
    createdAt: Date;
    unite: Readonly<{
        id: string;
        numero: string;
        isMeuble: boolean;
        frequencePaiement: FrequencePaiement;
        immeuble: Readonly<{ id: string; nom: string }>;
    }>;
    locataire: Readonly<{
        id: string;
        nom: string;
        prenom: string;
        raisonSociale: string | null;
    }>;
}>;
