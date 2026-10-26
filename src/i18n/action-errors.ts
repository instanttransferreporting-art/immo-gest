import { NoOrganizationContextError, UnauthenticatedError } from "@/lib/auth";
import { ForbiddenError } from "@/lib/permissions";
import { getI18n } from "@/i18n/server";

/**
 * Message traduit pour les erreurs d'autorisation communes à toutes les Server Actions
 * (non connecté, rôle insuffisant, compte sans entreprise), ou null pour toute autre erreur.
 */
export async function authErrorMessage(error: unknown): Promise<string | null> {
    const { t } = await getI18n();

    if (error instanceof UnauthenticatedError) {
        return t.common.errors.unauthenticated;
    }

    if (error instanceof ForbiddenError) {
        return t.common.errors.forbidden;
    }

    if (error instanceof NoOrganizationContextError) {
        return t.common.errors.noOrganization;
    }

    return null;
}
