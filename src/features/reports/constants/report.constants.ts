import type { ReportCategory, ReportType } from "@/features/reports/types/report.types";

export const REPORT_CATEGORY_LABELS: Readonly<Record<ReportCategory, string>> = {
    LOCATIFS: "Locatifs",
    FINANCIERS: "Financiers",
    PERFORMANCE: "Performance",
};

export type ReportDefinition = {
    type: ReportType;
    category: ReportCategory;
    label: string;
    description: string;
    isAmount: boolean;
};

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
    {
        type: "locataires",
        category: "LOCATIFS",
        label: "Liste des locataires",
        description: "Toutes les fiches locataires de l'organisation.",
        isAmount: false,
    },
    {
        type: "biens",
        category: "LOCATIFS",
        label: "Liste des biens",
        description: "Toutes les unités locatives, immeuble par immeuble.",
        isAmount: false,
    },
    {
        type: "contrats-actifs",
        category: "LOCATIFS",
        label: "Contrats actifs",
        description: "Baux actuellement en cours.",
        isAmount: false,
    },
    {
        type: "contrats-expires",
        category: "LOCATIFS",
        label: "Contrats expirés",
        description: "Baux résiliés ou arrivés à échéance.",
        isAmount: false,
    },
    {
        type: "loyers-factures",
        category: "FINANCIERS",
        label: "Loyers facturés",
        description: "Toutes les factures émises.",
        isAmount: true,
    },
    {
        type: "loyers-encaisses",
        category: "FINANCIERS",
        label: "Loyers encaissés",
        description: "Tous les paiements enregistrés (hors annulés).",
        isAmount: true,
    },
    {
        type: "impayes",
        category: "FINANCIERS",
        label: "Impayés",
        description: "Factures non soldées à ce jour.",
        isAmount: true,
    },
    {
        type: "cautions",
        category: "FINANCIERS",
        label: "Cautions",
        description: "Dépôts de garantie et leur statut de restitution.",
        isAmount: true,
    },
    {
        type: "charges",
        category: "FINANCIERS",
        label: "Charges locatives",
        description: "Charges définies sur les contrats actifs.",
        isAmount: true,
    },
] as const;
