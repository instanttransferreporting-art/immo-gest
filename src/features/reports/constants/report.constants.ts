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
    /** Date sur laquelle porte la période sélectionnée ; null = instantané, non filtré. */
    periodBasis: string | null;
};

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
    {
        type: "locataires",
        category: "LOCATIFS",
        label: "Liste des locataires",
        description: "Toutes les fiches locataires de l'organisation.",
        isAmount: false,
        periodBasis: "date d'inscription",
    },
    {
        type: "biens",
        category: "LOCATIFS",
        label: "Liste des biens",
        description: "Toutes les unités locatives, immeuble par immeuble.",
        isAmount: false,
        periodBasis: null,
    },
    {
        type: "contrats-actifs",
        category: "LOCATIFS",
        label: "Contrats actifs",
        description: "Baux actuellement en cours.",
        isAmount: false,
        periodBasis: "bail en cours sur la période",
    },
    {
        type: "contrats-expires",
        category: "LOCATIFS",
        label: "Contrats expirés",
        description: "Baux résiliés ou arrivés à échéance.",
        isAmount: false,
        periodBasis: "date de fin du bail",
    },
    {
        type: "loyers-factures",
        category: "FINANCIERS",
        label: "Loyers facturés",
        description: "Toutes les factures émises.",
        isAmount: true,
        periodBasis: "date d'échéance",
    },
    {
        type: "loyers-encaisses",
        category: "FINANCIERS",
        label: "Loyers encaissés",
        description: "Tous les paiements enregistrés (hors annulés).",
        isAmount: true,
        periodBasis: "date de paiement",
    },
    {
        type: "impayes",
        category: "FINANCIERS",
        label: "Impayés",
        description: "Factures non soldées, par échéance.",
        isAmount: true,
        periodBasis: "date d'échéance",
    },
    {
        type: "cautions",
        category: "FINANCIERS",
        label: "Cautions",
        description: "Dépôts de garantie et leur statut de restitution.",
        isAmount: true,
        periodBasis: "date d'enregistrement",
    },
    {
        type: "charges",
        category: "FINANCIERS",
        label: "Charges locatives",
        description: "Charges définies sur les contrats actifs.",
        isAmount: true,
        periodBasis: "bail en cours sur la période",
    },
] as const;
