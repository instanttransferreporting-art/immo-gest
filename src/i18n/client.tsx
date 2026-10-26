"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getFormatters } from "@/i18n/format";
import { MESSAGES } from "@/i18n/messages";
import { translateValidation } from "@/i18n/validation-keys";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/**
 * Fournit la langue (déterminée côté serveur par `getLocale`) aux composants client.
 * Seule la locale traverse la frontière serveur/client : les dictionnaires contiennent
 * des fonctions d'interpolation (non sérialisables) et sont importés directement ici.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
    return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Traductions (`t`), formateurs (`f`) et traduction des erreurs de validation (`tv`) côté client. */
export function useI18n() {
    const locale = useContext(LocaleContext);

    return useMemo(() => {
        const t = MESSAGES[locale];

        return {
            locale,
            t,
            f: getFormatters(locale),
            tv: (message: string | undefined) => translateValidation(message, t.validation),
        };
    }, [locale]);
}
