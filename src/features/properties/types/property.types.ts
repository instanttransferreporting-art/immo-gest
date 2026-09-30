export type TelephoneProprietaireDTO = Readonly<{
    id: string;
    numero: string;
    estPrincipal: boolean;
}>;

export type EmailProprietaireDTO = Readonly<{
    id: string;
    email: string;
    estPrincipal: boolean;
}>;

export type ProprietaireDTO = Readonly<{
    id: string;
    nom: string;
    prenom: string | null;
    adresse: string;
    ville: string;
    tauxCommission: number;
    telephones: readonly TelephoneProprietaireDTO[];
    emails: readonly EmailProprietaireDTO[];
    createdAt: Date;
}>;

export type ProprietaireOptionDTO = Readonly<{
    id: string;
    nom: string;
    prenom: string | null;
}>;

export type ImmeubleDTO = Readonly<{
    id: string;
    reference: string;
    nom: string;
    adresse: string;
    ville: string;
    nombreNiveaux: number;
    valeurEstimative: number | null;
    proprietaireId: string;
    proprietaire: ProprietaireOptionDTO;
    createdAt: Date;
}>;

export type ImmeubleOptionDTO = Readonly<{
    id: string;
    nom: string;
}>;
