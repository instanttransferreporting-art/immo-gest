import type { EtatUnite, TypeCharges, TypeUnite } from "@/generated/prisma/enums";

export type UniteDTO = Readonly<{
    id: string;
    immeubleId: string;
    numero: string;
    type: TypeUnite;
    surface: number;
    nombrePieces: number;
    loyerMensuel: number;
    typeCharges: TypeCharges;
    valeurCharges: number;
    caution: number;
    etat: EtatUnite;
    createdAt: Date;
}>;

export type UniteLibreOptionDTO = Readonly<{
    id: string;
    numero: string;
    loyerMensuel: number;
    caution: number;
    immeuble: Readonly<{ id: string; nom: string }>;
}>;
