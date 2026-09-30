import { FrequenceEcheance } from "@/generated/prisma/enums";

/**
 * Calcule la date de fin réglementaire d'un bail classique : le 31 décembre
 * de l'année de la date de début, pour respecter les périodes fiscales.
 * Ne s'applique pas aux baux à la nuitée (frequence = QUOTIDIEN), qui
 * conservent une date de fin librement définie.
 */
export function calculateDateFinAuto(dateDebut: Date): Date {
    return new Date(dateDebut.getFullYear(), 11, 31);
}

/**
 * Calcule le montant total du contrat selon la fréquence choisie.
 *
 * Pour QUOTIDIEN (nuitées) : nombreNuitees × tarifParNuit
 * Pour les autres fréquences : loyerBase (pas de calcul supplémentaire)
 */
export function calculateMontantContrat(params: {
    frequence: FrequenceEcheance;
    loyerBase: number;
    nombreNuitees?: number;
}): number | null {
    const { frequence, loyerBase, nombreNuitees } = params;

    if (frequence === FrequenceEcheance.QUOTIDIEN) {
        if (!nombreNuitees || nombreNuitees <= 0 || !loyerBase) {
            return null;
        }
        return nombreNuitees * loyerBase;
    }

    return loyerBase;
}

/**
 * Retourne la description du mode de facturation selon la fréquence.
 */
export function getFrequenceDescription(frequence: FrequenceEcheance): string {
    switch (frequence) {
        case FrequenceEcheance.QUOTIDIEN:
            return "Facturation à la nuitée (tarif par nuit × nombre de nuits)";
        case FrequenceEcheance.MENSUEL:
            return "Facturation mensuelle";
        case FrequenceEcheance.BIMENSUEL:
            return "Facturation toutes les 2 semaines";
        case FrequenceEcheance.TRIMESTRIEL:
            return "Facturation trimestrielle (tous les 3 mois)";
        case FrequenceEcheance.SEMESTRIEL:
            return "Facturation semestrielle (tous les 6 mois)";
        case FrequenceEcheance.ANNUEL:
            return "Facturation annuelle";
        default:
            return "";
    }
}
