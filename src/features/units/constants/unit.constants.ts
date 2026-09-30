import { EtatUnite, FrequencePaiement, TypeCharges, TypeUnite } from "@/generated/prisma/enums";

export const TYPE_UNITE_LABELS: Readonly<Record<TypeUnite, string>> = {
    APPARTEMENT: "Appartement",
    VILLA: "Villa",
    BUREAU: "Bureau",
    COMMERCE: "Commerce",
    ENTREPOT: "Entrepôt",
    STUDIO: "Studio",
    CHAMBRE: "Chambre",
    DUPLEX: "Duplex",
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

export const FREQUENCE_PAIEMENT_LABELS: Readonly<Record<FrequencePaiement, string>> = {
    NUITEE: "À la nuitée",
    HEBDOMADAIRE: "Hebdomadaire",
    MENSUEL: "Mensuel",
    TRIMESTRIEL: "Trimestriel",
    ANNUEL: "Annuel",
    AUTRE: "Autre",
};
