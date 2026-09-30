import { TypeLocataire } from "@/generated/prisma/enums";

export const TYPE_LOCATAIRE_LABELS: Readonly<Record<TypeLocataire, string>> = {
    PHYSIQUE: "Personne Physique",
    MORALE: "Personne Morale",
};

export const TYPE_DOCUMENT = {
    CNI: "CNI",
    PHOTO: "PHOTO_4X4",
    CONTRAT_SIMPLIFIE: "CONTRAT_SIMPLIFIE",
    CONTRAT_SIGNE: "CONTRAT_SIGNE",
    PREUVE_ENREGISTREMENT: "PREUVE_ENREGISTREMENT",
} as const;

export type TypeDocument = (typeof TYPE_DOCUMENT)[keyof typeof TYPE_DOCUMENT];

export const TYPE_DOCUMENT_LABELS: Readonly<Record<TypeDocument, string>> = {
    CNI: "Pièce d'identité (CNI)",
    PHOTO_4X4: "Photo 4x4",
    CONTRAT_SIMPLIFIE: "Contrat simplifié",
    CONTRAT_SIGNE: "Contrat signé",
    PREUVE_ENREGISTREMENT: "Preuve d'enregistrement",
};
