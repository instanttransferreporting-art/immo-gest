"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { immeubleSchema } from "@/features/properties/schemas/property.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ImmeubleDTO } from "@/features/properties/types/property.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createImmeuble(input: unknown): Promise<ActionResponse<ImmeubleDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("IMMEUBLE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = immeubleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const immeuble = await ImmeubleService.create(parsed.data);

        if (!immeuble) {
            return {
                success: false,
                message: t.properties.buildings.ownerNotFound,
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_CREATE",
            details: `Immeuble "${immeuble.nom}" (${immeuble.reference}) créé.`,
        });

        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: t.properties.buildings.created,
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: t.properties.buildings.createFailed,
        };
    }
}

export async function updateImmeuble(id: string, input: unknown): Promise<ActionResponse<ImmeubleDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("IMMEUBLE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = immeubleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const immeuble = await ImmeubleService.update(id, parsed.data);

        if (!immeuble) {
            return {
                success: false,
                message: t.properties.buildings.notFound,
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_UPDATE",
            details: `Immeuble "${immeuble.nom}" (${immeuble.reference}) modifié.`,
        });

        revalidatePath(ROUTES.PROPERTIES);
        revalidatePath(`${ROUTES.PROPERTIES}/${id}`);

        return {
            success: true,
            message: t.properties.buildings.updated,
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: t.properties.buildings.updateFailed,
        };
    }
}

export async function deleteImmeuble(id: string): Promise<ActionResponse<void>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("IMMEUBLE_DELETE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    try {
        const immeuble = await ImmeubleService.delete(id);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_DELETE",
            details: `Immeuble (id: ${id}) supprimé.`,
        });

        revalidatePath(ROUTES.PROPERTIES);
        revalidatePath(`${ROUTES.PROPERTIES}/${id}`);

        return {
            success: true,
            message: t.properties.buildings.deleted,
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: t.properties.buildings.deleteFailed,
        };
    }
}
