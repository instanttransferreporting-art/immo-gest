import { StatutReversement } from "@/generated/prisma/enums";

export const STATUT_REVERSEMENT_LABELS: Readonly<Record<StatutReversement, string>> = {
    BROUILLON: "Brouillon",
    VALIDE: "Validé",
};
