import { FrequenceEcheance, StatutBail } from "@/generated/prisma/enums";

export const FREQUENCE_LABELS: Readonly<Record<FrequenceEcheance, string>> = {
    QUOTIDIEN: "Quotidien",
    MENSUEL: "Mensuel",
    BIMENSUEL: "Bimensuel",
    TRIMESTRIEL: "Trimestriel",
    SEMESTRIEL: "Semestriel",
    ANNUEL: "Annuel",
};

export const STATUT_BAIL_LABELS: Readonly<Record<StatutBail, string>> = {
    ACTIF: "Actif",
    SUSPENDU: "Suspendu",
    RESILIE: "Résilié",
    EXPIRE: "Expiré",
};
