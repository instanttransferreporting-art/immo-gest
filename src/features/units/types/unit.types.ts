import type { EtatUnite, FrequencePaiement, TypeCharges, TypeUnite } from "@/generated/prisma/enums";

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
    isMeuble: boolean;
    frequencePaiement: FrequencePaiement;
    frequenceAutreTexte: string | null;
    createdAt: Date;
}>;

export type UniteLibreOptionDTO = Readonly<{
    id: string;
    numero: string;
    loyerMensuel: number;
    caution: number;
    isMeuble: boolean;
    frequencePaiement: FrequencePaiement;
    immeuble: Readonly<{ id: string; nom: string }>;
}>;

export type UniteOptionDTO = Readonly<{
    id: string;
    numero: string;
    immeuble: Readonly<{ id: string; nom: string }>;
}>;
