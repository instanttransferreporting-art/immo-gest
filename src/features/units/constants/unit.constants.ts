import { EtatUnite, TypeCharges, TypeUnite } from "@/generated/prisma/enums";

export const TYPE_UNITE_LABELS: Readonly<Record<TypeUnite, string>> = {
    APPARTEMENT: "Appartement",
    VILLA: "Villa",
    BUREAU: "Bureau",
    COMMERCE: "Commerce",
    ENTREPOT: "Entrepôt",
};

export const ETAT_UNITE_LABELS: Readonly<Record<EtatUnite, string>> = {
    LIBRE: "Libre",
    OCCUPE: "Occupé",
    RESERVE: "Réservé",
};

export const TYPE_CHARGES_LABELS: Readonly<Record<TypeCharges, string>> = {
    FORFAITAIRE: "Forfaitaire",
    POURCENTAGE: "Pourcentage du loyer",
};
