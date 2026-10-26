import type { Locale } from "@/generated/prisma/enums";

export type { Locale };

export const LOCALES = ["fr", "en"] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = "fr";

/** Cookie de repli : langue de la page de connexion (avant toute session). */
export const LOCALE_COOKIE = "immo-gest-locale";

/** Locale Intl utilisée pour formater dates, nombres et montants. */
export const INTL_LOCALES: Readonly<Record<Locale, string>> = {
    fr: "fr-FR",
    en: "en-GB",
};

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
    fr: "Français",
    en: "English",
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
