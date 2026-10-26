"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { UniteService } from "@/features/units/services/unite.service";
import { uniteSchema, uniteUpdateSchema } from "@/features/units/schemas/unit.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { UniteDTO } from "@/features/units/types/unit.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createUnite(input: unknown): Promise<ActionResponse<UniteDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("UNITE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = uniteSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const unite = await UniteService.create(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "UNITE_CREATE",
            details: `Unité "${unite.numero}" créée.`,
        });

        revalidatePath(`${ROUTES.PROPERTIES}/${parsed.data.immeubleId}`);

        return {
            success: true,
            message: t.units.created,
            data: unite,
        };
    } catch {
        return {
            success: false,
            message: t.units.createFailed,
        };
    }
}

export async function updateUnite(id: string, input: unknown): Promise<ActionResponse<UniteDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("UNITE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = uniteUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const unite = await UniteService.update(id, parsed.data);

        if (!unite) {
            return {
                success: false,
                message: t.units.notFound,
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "UNITE_UPDATE",
            details: `Unité "${unite.numero}" modifiée.`,
        });

        revalidatePath(`${ROUTES.PROPERTIES}/${unite.immeubleId}`);

        return {
            success: true,
            message: t.units.updated,
            data: unite,
        };
    } catch {
        return {
            success: false,
            message: t.units.updateFailed,
        };
    }
}
