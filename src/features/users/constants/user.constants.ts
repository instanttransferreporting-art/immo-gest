import { RoleType } from "@/generated/prisma/enums";

/**
 * Rôles qu'un ADMIN peut attribuer aux membres de son équipe.
 * SUPER_ADMIN est volontairement exclu : il n'est jamais créable depuis une entreprise.
 */
export const ASSIGNABLE_ROLES = [
    RoleType.ADMIN,
    RoleType.GESTIONNAIRE,
    RoleType.COMPTABLE,
    RoleType.DIRECTEUR_GENERAL,
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
