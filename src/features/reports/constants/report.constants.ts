import type { ReportCategory, ReportType } from "@/features/reports/types/report.types";

export const REPORT_CATEGORIES: readonly ReportCategory[] = ["LOCATIFS", "FINANCIERS", "PERFORMANCE"];

/**
 * Rapports disponibles. Libellés, descriptions et date de filtrage sont traduits
 * dans `t.reports.definitions[type]` (i18n/messages/reports.ts).
 */
export type ReportDefinition = {
    type: ReportType;
    category: ReportCategory;
    isAmount: boolean;
    /** false = instantané, non filtré par la période sélectionnée. */
    filteredByPeriod: boolean;
};

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
    { type: "locataires", category: "LOCATIFS", isAmount: false, filteredByPeriod: true },
    { type: "biens", category: "LOCATIFS", isAmount: false, filteredByPeriod: false },
    { type: "contrats-actifs", category: "LOCATIFS", isAmount: false, filteredByPeriod: true },
    { type: "contrats-expires", category: "LOCATIFS", isAmount: false, filteredByPeriod: true },
    { type: "loyers-factures", category: "FINANCIERS", isAmount: true, filteredByPeriod: true },
    { type: "loyers-encaisses", category: "FINANCIERS", isAmount: true, filteredByPeriod: true },
    { type: "impayes", category: "FINANCIERS", isAmount: true, filteredByPeriod: true },
    { type: "cautions", category: "FINANCIERS", isAmount: true, filteredByPeriod: true },
    { type: "charges", category: "FINANCIERS", isAmount: true, filteredByPeriod: true },
] as const;
