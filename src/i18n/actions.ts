"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getCurrentSession } from "@/lib/auth";
import { UserRepository } from "@/features/auth/repositories/user.repository";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Change la langue de l'interface : enregistrée sur le compte si l'utilisateur est
 * connecté (retrouvée sur tous ses appareils), et dans un cookie pour la page de connexion.
 */
export async function setLocale(locale: unknown): Promise<{ success: boolean }> {
    if (!isLocale(locale)) {
        return { success: false };
    }

    const session = await getCurrentSession();

    if (session) {
        await UserRepository.updateLocale(session.user.id, locale);
    }

    (await cookies()).set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
        sameSite: "lax",
    });

    revalidatePath("/", "layout");

    return { success: true };
}
