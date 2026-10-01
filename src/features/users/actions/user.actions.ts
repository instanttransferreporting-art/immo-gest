"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { EmailAlreadyUsedError } from "@/features/auth/services/auth.service";
import {
    createUserSchema,
    resetPasswordSchema,
    updateUserSchema,
} from "@/features/users/schemas/user.schema";
import {
    LastAdminError,
    SelfModificationError,
    UserManagementService,
    UserNotFoundError,
} from "@/features/users/services/user-management.service";
import type { TeamMemberDTO } from "@/features/users/types/user.types";
import { ROLE_LABELS } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";

type GuardResult = { ok: true; user: Session["user"] } | { ok: false; response: ActionResponse<never> };

async function guard(): Promise<GuardResult> {
    try {
        return { ok: true, user: await checkPermission("USER_MANAGE") };
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { ok: false, response: { success: false, message: error.message } };
        }

        throw error;
    }
}

function businessErrorResponse(error: unknown): ActionResponse<never> | null {
    if (error instanceof UserNotFoundError || error instanceof SelfModificationError || error instanceof LastAdminError) {
        return { success: false, message: error.message };
    }

    return null;
}

function fullName(member: TeamMemberDTO): string {
    return `${member.prenom} ${member.nom} (${member.email})`;
}

export async function createUser(input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = createUserSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const organizationId = effectiveOrganizationId(auth.user);

    try {
        const member = await UserManagementService.create(organizationId, parsed.data);

        AuditService.log({
            organizationId,
            userId: auth.user.id,
            action: "USER_CREATE",
            details: `Compte créé pour ${fullName(member)} — rôle : ${ROLE_LABELS[member.role]}.`,
        });

        revalidatePath(ROUTES.USERS);

        return { success: true, message: "Utilisateur créé avec succès.", data: member };
    } catch (error) {
        if (error instanceof EmailAlreadyUsedError) {
            return { success: false, message: error.message, errors: { email: [error.message] } };
        }

        return { success: false, message: "Une erreur est survenue lors de la création de l'utilisateur." };
    }
}

export async function updateUser(userId: string, input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = updateUserSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const organizationId = effectiveOrganizationId(auth.user);

    try {
        const member = await UserManagementService.update(organizationId, userId, parsed.data, auth.user.id);

        AuditService.log({
            organizationId,
            userId: auth.user.id,
            action: "USER_UPDATE",
            details: `Compte de ${fullName(member)} modifié — rôle : ${ROLE_LABELS[member.role]}.`,
        });

        revalidatePath(ROUTES.USERS);

        return { success: true, message: "Utilisateur mis à jour avec succès.", data: member };
    } catch (error) {
        const response = businessErrorResponse(error);

        if (response) {
            return response;
        }

        return { success: false, message: "Une erreur est survenue lors de la mise à jour de l'utilisateur." };
    }
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResponse<TeamMemberDTO>> {
    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const organizationId = effectiveOrganizationId(auth.user);

    try {
        const member = await UserManagementService.setActive(organizationId, userId, isActive, auth.user.id);

        AuditService.log({
            organizationId,
            userId: auth.user.id,
            action: isActive ? "USER_REACTIVATE" : "USER_DEACTIVATE",
            details: `Compte de ${fullName(member)} ${isActive ? "réactivé" : "désactivé"}.`,
        });

        revalidatePath(ROUTES.USERS);

        return {
            success: true,
            message: isActive ? "Utilisateur réactivé avec succès." : "Utilisateur désactivé avec succès.",
            data: member,
        };
    } catch (error) {
        const response = businessErrorResponse(error);

        if (response) {
            return response;
        }

        return { success: false, message: "Une erreur est survenue lors de la mise à jour du statut." };
    }
}

export async function resetUserPassword(userId: string, input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = resetPasswordSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const organizationId = effectiveOrganizationId(auth.user);

    try {
        const member = await UserManagementService.resetPassword(organizationId, userId, parsed.data.password);

        AuditService.log({
            organizationId,
            userId: auth.user.id,
            action: "USER_PASSWORD_RESET",
            details: `Mot de passe réinitialisé pour ${fullName(member)}.`,
        });

        return { success: true, message: "Mot de passe réinitialisé avec succès.", data: member };
    } catch (error) {
        const response = businessErrorResponse(error);

        if (response) {
            return response;
        }

        return { success: false, message: "Une erreur est survenue lors de la réinitialisation du mot de passe." };
    }
}
