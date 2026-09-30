import type { StatutFacture } from "@/features/invoices/types/invoice.types";

export const STATUT_FACTURE_LABELS: Readonly<Record<StatutFacture, string>> = {
    EN_ATTENTE: "En attente",
    PAYEE: "Payée",
    PARTIEL: "Partiel",
};

export const MOIS_LABELS: readonly string[] = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];
