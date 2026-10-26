import { cache } from "react";
import { cookies, headers } from "next/headers";

import { getCurrentSession } from "@/lib/auth";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { getFormatters } from "@/i18n/format";
import { MESSAGES } from "@/i18n/messages";
import { translateValidation } from "@/i18n/validation-keys";

/**
 * Langue de la requête courante, par ordre de priorité :
 * 1. la langue enregistrée sur le compte connecté (relue en base à chaque requête, cf. lib/auth.ts) ;
 * 2. le cookie de langue (page de connexion, avant toute session) ;
 * 3. la langue préférée du navigateur ;
 * 4. le français.
 */
export const getLocale = cache(async (): Promise<Locale> => {
    const session = await getCurrentSession();

    if (isLocale(session?.user.locale)) {
        return session.user.locale;
    }

    const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;

    if (isLocale(cookieLocale)) {
        return cookieLocale;
    }

    const acceptLanguage = (await headers()).get("accept-language") ?? "";
    const preferred = acceptLanguage.split(",")[0]?.trim().slice(0, 2).toLowerCase();

    return isLocale(preferred) ? preferred : DEFAULT_LOCALE;
});

/** Traductions et formateurs de la requête courante, pour les Server Components, actions et exports. */
export const getI18n = cache(async () => {
    const locale = await getLocale();
    const t = MESSAGES[locale];

    return {
        locale,
        t,
        f: getFormatters(locale),
        tv: (message: string | undefined) => translateValidation(message, t.validation),
    };
});
