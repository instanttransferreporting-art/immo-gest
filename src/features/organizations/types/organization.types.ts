export type OrganizationDTO = Readonly<{
    id: string;
    nom: string;
    logo: string | null;
    tauxCommissionDefaut: number;
    adresse: string | null;
    ville: string | null;
    telephone: string | null;
    email: string | null;
    isActive: boolean;
    updatedAt: Date;
}>;
