/**
 * Formate un montant pour un document react-pdf. La police interne (Helvetica,
 * WinAnsi) ne sait pas afficher l'espace fine insécable (U+202F) qu'utilise
 * Intl.NumberFormat("fr-FR", {style:"currency"}) comme séparateur de milliers —
 * elle s'affiche comme un "/". On regroupe donc les milliers nous-mêmes avec
 * une espace ASCII normale.
 */
export function formatMontantPdf(amount: number): string {
    const rounded = Math.round(amount);
    const withThousandsSeparator = Math.abs(rounded)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return `${rounded < 0 ? "-" : ""}${withThousandsSeparator} FCFA`;
}
