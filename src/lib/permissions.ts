import type { Session } from "next-auth";

import { getCurrentSession, UnauthenticatedError } from "@/lib/auth";
import { PERMISSIONS, type PermissionKey } from "@/constants/permissions";
import { RoleType } from "@/generated/prisma/enums";

export class ForbiddenError extends Error {
    constructor() {
        super("Vous n'avez pas la permission d'effectuer cette action.");
        this.name = "ForbiddenError";
    }
}

/**
 * Vérifie que l'utilisateur connecté possède le rôle requis pour `permission`.
 * Un SUPER_ADMIN en train de "visiter" une entreprise (impersonation) est traité
 * comme un ADMIN de cette entreprise pour les permissions org-scoped.
 * Retourne l'utilisateur de session (id, organizationId, role) pour éviter un second appel.
 * Jette UnauthenticatedError si non connecté, ForbiddenError si le rôle n'est pas autorisé.
 */
export async function checkPermission(permission: PermissionKey): Promise<Session["user"]> {
    const session = await getCurrentSession();

    if (!session) {
        throw new UnauthenticatedError();
    }

    const effectiveRole = session.user.impersonatedOrganizationId ? RoleType.ADMIN : session.user.role;
    const allowedRoles: readonly RoleType[] = PERMISSIONS[permission];

    if (!allowedRoles.includes(effectiveRole)) {
        throw new ForbiddenError();
    }

    return session.user;
}
