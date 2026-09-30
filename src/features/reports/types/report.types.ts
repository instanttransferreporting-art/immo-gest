export type ReportCategory = "LOCATIFS" | "FINANCIERS" | "PERFORMANCE";

export type ReportType =
    | "locataires"
    | "biens"
    | "contrats-actifs"
    | "contrats-expires"
    | "loyers-factures"
    | "loyers-encaisses"
    | "impayes"
    | "cautions"
    | "charges";

export type ReportSummaryDTO = {
    type: ReportType;
    count: number;
    total: number | null;
};

export type OccupationImmeubleDTO = {
    immeubleId: string;
    immeubleNom: string;
    totalUnites: number;
    unitesOccupees: number;
    tauxOccupation: number;
};

export type RendementImmeubleDTO = {
    immeubleId: string;
    immeubleNom: string;
    valeurEstimative: number | null;
    revenuAnnuelEncaisse: number;
    rendement: number | null;
};

export type RentabiliteGlobaleDTO = {
    totalFacture: number;
    totalEncaisse: number;
    totalImpaye: number;
    tauxRecouvrement: number;
};

export type PerformanceSummaryDTO = {
    occupationParImmeuble: OccupationImmeubleDTO[];
    rendementParImmeuble: RendementImmeubleDTO[];
    rentabiliteGlobale: RentabiliteGlobaleDTO;
};
