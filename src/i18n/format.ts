import { INTL_LOCALES, type Locale } from "@/i18n/config";

/** Formateurs de dates, nombres et montants (FCFA) propres à une langue. */
export type Formatters = ReturnType<typeof buildFormatters>;

function buildFormatters(locale: Locale) {
    const intl = INTL_LOCALES[locale];

    const currency = new Intl.NumberFormat(intl, { style: "currency", currency: "XAF", maximumFractionDigits: 0 });
    const number = new Intl.NumberFormat(intl, { maximumFractionDigits: 2 });
    const percent = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 });
    const dateMedium = new Intl.DateTimeFormat(intl, { dateStyle: "medium" });
    const dateLong = new Intl.DateTimeFormat(intl, { dateStyle: "long" });
    const dateShort = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "2-digit", year: "numeric" });
    const dateTime = new Intl.DateTimeFormat(intl, { dateStyle: "medium", timeStyle: "short" });
    const monthYear = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" });
    const monthName = new Intl.DateTimeFormat(intl, { month: "long" });

    return {
        locale,
        intl,
        /** 350 000 FCFA / FCFA 350,000 */
        currency: (value: number) => currency.format(value),
        number: (value: number) => number.format(value),
        /** Valeur déjà en pourcentage (12.5 → « 12,5 »), sans le signe %. */
        percent: (value: number) => percent.format(value),
        date: (value: Date | string) => dateMedium.format(new Date(value)),
        dateLong: (value: Date | string) => dateLong.format(new Date(value)),
        dateShort: (value: Date | string) => dateShort.format(new Date(value)),
        dateTime: (value: Date | string) => dateTime.format(new Date(value)),
        /** « septembre 2026 » à partir d'un mois 1–12. */
        monthYear: (mois: number, annee: number) => capitalize(monthYear.format(new Date(annee, mois - 1, 1))),
        /** Nom du mois 1–12, avec majuscule. */
        monthName: (mois: number) => capitalize(monthName.format(new Date(2000, mois - 1, 1))),
    };
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

const cache = new Map<Locale, Formatters>();

export function getFormatters(locale: Locale): Formatters {
    let formatters = cache.get(locale);

    if (!formatters) {
        formatters = buildFormatters(locale);
        cache.set(locale, formatters);
    }

    return formatters;
}
