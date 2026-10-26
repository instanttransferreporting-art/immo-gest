"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import { effectiveOrganizationId } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";
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
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";
import type { Messages } from "@/i18n/messages";

type GuardResult = { ok: true; user: Session["user"] } | { ok: false; response: ActionResponse<never> };

async function guard(): Promise<GuardResult> {
    try {
        return { ok: true, user: await checkPermission("USER_MANAGE") };
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { ok: false, response: { success: false, message: authMessage } };
        }

        throw error;
    }
}

function businessErrorResponse(error: unknown, t: Messages): ActionResponse<never> | null {
    if (error instanceof UserNotFoundError) {
        return { success: false, message: t.admin.users.errors.notFound };
    }

    if (error instanceof SelfModificationError) {
        return { success: false, message: t.admin.users.errors.selfModification };
    }

    if (error instanceof LastAdminError) {
        return { success: false, message: t.admin.users.errors.lastAdmin };
    }

    return null;
}

function fullName(member: TeamMemberDTO): string {
    return `${member.prenom} ${member.nom} (${member.email})`;
}

export async function createUser(input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const { t } = await getI18n();

    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = createUserSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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

        return { success: true, message: t.admin.users.created, data: member };
    } catch (error) {
        if (error instanceof EmailAlreadyUsedError) {
            return {
                success: false,
                message: t.admin.users.errors.emailTaken,
                errors: { email: [t.admin.users.errors.emailTaken] },
            };
        }

        return { success: false, message: t.admin.users.createFailed };
    }
}

export async function updateUser(userId: string, input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const { t } = await getI18n();

    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = updateUserSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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

        return { success: true, message: t.admin.users.updated, data: member };
    } catch (error) {
        const response = businessErrorResponse(error, t);

        if (response) {
            return response;
        }

        return { success: false, message: t.admin.users.updateFailed };
    }
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResponse<TeamMemberDTO>> {
    const { t } = await getI18n();

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
            message: isActive ? t.admin.users.reactivated : t.admin.users.deactivated,
            data: member,
        };
    } catch (error) {
        const response = businessErrorResponse(error, t);

        if (response) {
            return response;
        }

        return { success: false, message: t.admin.users.statusFailed };
    }
}

export async function resetUserPassword(userId: string, input: unknown): Promise<ActionResponse<TeamMemberDTO>> {
    const { t } = await getI18n();

    const auth = await guard();

    if (!auth.ok) {
        return auth.response;
    }

    const parsed = resetPasswordSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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

        return { success: true, message: t.admin.users.passwordReset, data: member };
    } catch (error) {
        const response = businessErrorResponse(error, t);

        if (response) {
            return response;
        }

        return { success: false, message: t.admin.users.passwordResetFailed };
    }
}
