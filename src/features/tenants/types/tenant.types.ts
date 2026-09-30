import type { StatutBail, TypeLocataire } from "@/generated/prisma/enums";

export type LocataireContratDTO = Readonly<{
    id: string;
    numeroContrat: string;
    statut: StatutBail;
    dateDebut: Date;
    dateFin: Date;
    unite: Readonly<{ numero: string; immeuble: Readonly<{ nom: string }> }>;
}>;

export type LocataireDTO = Readonly<{
    id: string;
    type: TypeLocataire;
    nom: string;
    prenom: string;
    dateNaissance: Date | null;
    profession: string | null;
    telephone: string;
    email: string;
    adresse: string;
    pieceIdentite: string;
    revenuMensuelMoyen: number | null;
    raisonSociale: string | null;
    rccm: string | null;
    niu: string | null;
    telephoneMoral: string | null;
    emailMoral: string | null;
    createdAt: Date;
    contrats: readonly LocataireContratDTO[];
}>;

export type LocataireOptionDTO = Readonly<{
    id: string;
    nom: string;
    prenom: string;
    raisonSociale: string | null;
}>;

export type DocumentLocataireDTO = Readonly<{
    id: string;
    locataireId: string;
    typeDocument: string;
    cheminFichier: string;
    createdAt: Date;
}>;
