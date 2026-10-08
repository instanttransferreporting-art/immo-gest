const UNITS = [
    "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
    "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf",
];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];

function below100(n: number): string {
    if (n < 20) {
        return UNITS[n];
    }

    if (n < 70) {
        const unit = n % 10;
        const ten = TENS[Math.floor(n / 10)];
        return unit === 1 ? `${ten} et un` : unit === 0 ? ten : `${ten}-${UNITS[unit]}`;
    }

    if (n < 80) {
        // 70-79 : soixante-dix… ; 71 = soixante et onze
        return n === 71 ? "soixante et onze" : `soixante-${UNITS[n - 60]}`;
    }

    // 80-99 : quatre-vingt(s)…
    return n === 80 ? "quatre-vingts" : `quatre-vingt-${UNITS[n - 80]}`;
}

function below1000(n: number, final: boolean): string {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    let result = "";

    if (hundreds > 0) {
        result = hundreds === 1 ? "cent" : `${UNITS[hundreds]} cent`;
        // « cents » prend un s uniquement s'il termine le nombre
        if (rest === 0 && hundreds > 1 && final) {
            result += "s";
        }
    }

    if (rest > 0) {
        const restWords = below100(rest);
        // « quatre-vingts » perd son s quand il est suivi d'un autre mot
        result = result ? `${result} ${restWords}` : restWords;
    }

    return result;
}

/** Convertit un entier positif en lettres françaises (jusqu'aux milliards). */
export function numberToWordsFr(value: number): string {
    const n = Math.floor(Math.abs(value));

    if (n === 0) {
        return UNITS[0];
    }

    const scales: Array<[number, string, string]> = [
        [1_000_000_000, "milliard", "milliards"],
        [1_000_000, "million", "millions"],
        [1_000, "mille", "mille"],
    ];

    let remaining = n;
    const parts: string[] = [];

    for (const [size, singular, plural] of scales) {
        const count = Math.floor(remaining / size);
        remaining %= size;

        if (count === 0) {
            continue;
        }

        if (size === 1_000) {
            parts.push(count === 1 ? "mille" : `${below1000(count, false)} mille`);
        } else {
            parts.push(`${below1000(count, false)} ${count > 1 ? plural : singular}`);
        }
    }

    if (remaining > 0) {
        parts.push(below1000(remaining, true));
    }

    // « quatre-vingts » devant mille/million/milliard perd son s
    return parts.join(" ").replace(/quatre-vingts (mille|million|milliard)/g, "quatre-vingt $1");
}

/** « 150 000 (cent cinquante mille) » */
export function formatMontantEnLettres(value: number): string {
    const formatted = new Intl.NumberFormat("fr-FR")
        .format(Math.round(value))
        .replace(/[\u202f\u00a0]/g, " ");

    return `${formatted} (${numberToWordsFr(value)})`;
}
