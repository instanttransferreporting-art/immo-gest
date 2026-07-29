import { StatutCaution } from "@/generated/prisma/enums";

export const STATUT_CAUTION_LABELS: Readonly<Record<StatutCaution, string>> = {
    EN_COURS: "En cours",
    RESTITUEE_TOTALE: "Restituée intégralement",
    RESTITUEE_PARTIELLE: "Restituée partiellement",
    RETENUE_TRAVAUX: "Retenue pour travaux",
};

export const STATUT_CAUTION_STYLES: Readonly<Record<StatutCaution, string>> = {
    EN_COURS: "bg-blue-100 text-blue-700",
    RESTITUEE_TOTALE: "bg-emerald-100 text-emerald-700",
    RESTITUEE_PARTIELLE: "bg-amber-100 text-amber-700",
    RETENUE_TRAVAUX: "bg-red-100 text-red-700",
};
