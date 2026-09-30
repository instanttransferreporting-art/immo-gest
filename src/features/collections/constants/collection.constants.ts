import { NiveauRelance } from "@/generated/prisma/enums";

export const NIVEAU_RELANCE_LABELS: Readonly<Record<NiveauRelance, string>> = {
    NIVEAU_1: "Rappel amiable",
    NIVEAU_1_BIS: "2e rappel amiable",
    NIVEAU_2: "Mise en demeure",
    NIVEAU_3: "Contentieux",
};

export const NIVEAU_RELANCE_ORDER: readonly NiveauRelance[] = [
    NiveauRelance.NIVEAU_1,
    NiveauRelance.NIVEAU_1_BIS,
    NiveauRelance.NIVEAU_2,
    NiveauRelance.NIVEAU_3,
];

export const PROCHAINE_ACTION_LABELS: Readonly<Record<NiveauRelance, string>> = {
    NIVEAU_1: "Envoyer un rappel amiable",
    NIVEAU_1_BIS: "Envoyer le 2e rappel",
    NIVEAU_2: "Envoyer la mise en demeure",
    NIVEAU_3: "Passer au contentieux",
};
