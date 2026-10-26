export type OrganizationDTO = Readonly<{
    id: string;
    nom: string;
    logo: string | null;
    logoDocument: string | null;
    tauxCommissionDefaut: number;
    tauxPenaliteRetard: number;
    adresse: string | null;
    ville: string | null;
    telephone: string | null;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
}>;
