import type { TypeLocataire } from "@/generated/prisma/enums";

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
