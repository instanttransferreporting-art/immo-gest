export type PlatformStatsDTO = Readonly<{
    totalOrganizations: number;
    totalImmeubles: number;
    totalUnites: number;
    totalUsers: number;
}>;

export type OrganizationSummaryDTO = Readonly<{
    id: string;
    nom: string;
    logo: string | null;
    tauxCommissionDefaut: number;
    tauxPenaliteRetard: number;
    adresse: string | null;
    ville: string | null;
    telephone: string | null;
    email: string | null;
    createdAt: Date;
    totalImmeubles: number;
    totalUsers: number;
    isActive: boolean;
}>;
