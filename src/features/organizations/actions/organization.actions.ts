"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { logoFileSchema, logoKindSchema, organizationSchema } from "@/features/organizations/schemas/organization.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function updateOrganization(input: unknown): Promise<ActionResponse<OrganizationDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_MANAGE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = organizationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const organization = await OrganizationService.update(parsed.data);

        revalidatePath(ROUTES.SETTINGS);

        return {
            success: true,
            message: t.admin.settings.updated,
            data: organization,
        };
    } catch {
        return {
            success: false,
            message: t.admin.settings.updateFailed,
        };
    }
}

export async function uploadOrganizationLogo(formData: FormData): Promise<ActionResponse<OrganizationDTO>> {
    const { t, tv } = await getI18n();

    let organizationId: string;

    try {
        organizationId = effectiveOrganizationId(await checkPermission("ORGANIZATION_MANAGE"));
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = logoFileSchema.safeParse(formData.get("logo"));
    const parsedKind = logoKindSchema.safeParse(formData.get("kind"));

    if (!parsed.success) {
        return { success: false, message: tv(parsed.error.issues[0]?.message) ?? t.common.invalidInput };
    }

    if (!parsedKind.success) {
        return { success: false, message: t.admin.settings.logo.invalidKind };
    }

    try {
        const organization = await OrganizationService.updateLogo(organizationId, parsedKind.data, parsed.data);

        // Le logo apparaît dans la barre latérale de toutes les pages.
        revalidatePath("/", "layout");

        return { success: true, message: t.admin.settings.logo.updated, data: organization };
    } catch (error) {
        console.error("[logo] Échec du téléversement", error);

        return { success: false, message: t.admin.settings.logo.uploadFailed };
    }
}

export async function removeOrganizationLogo(kind: unknown): Promise<ActionResponse<OrganizationDTO>> {
    const { t } = await getI18n();

    let organizationId: string;

    try {
        organizationId = effectiveOrganizationId(await checkPermission("ORGANIZATION_MANAGE"));
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsedKind = logoKindSchema.safeParse(kind);

    if (!parsedKind.success) {
        return { success: false, message: t.admin.settings.logo.invalidKind };
    }

    try {
        const organization = await OrganizationService.removeLogo(organizationId, parsedKind.data);

        revalidatePath("/", "layout");

        return { success: true, message: t.admin.settings.logo.removed, data: organization };
    } catch {
        return { success: false, message: t.admin.settings.logo.removeFailed };
    }
}
