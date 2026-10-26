"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/permissions";
import { EmailAlreadyUsedError } from "@/features/auth/services/auth.service";
import { logoFileSchema, logoKindSchema, organizationSchema } from "@/features/organizations/schemas/organization.schema";
import {
    OrganizationNotFoundError as OrganizationRecordNotFoundError,
    OrganizationService,
} from "@/features/organizations/services/organization.service";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";
import {
    OrganizationNotFoundError,
    OrganizationSuspendedError,
    PlatformService,
} from "@/features/platform/services/platform.service";
import { createOrganizationSchema } from "@/features/platform/schemas/platform.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createOrganization(input: unknown): Promise<ActionResponse<OrganizationSummaryDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = createOrganizationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const organization = await PlatformService.createOrganization(parsed.data);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: t.admin.platform.created,
            data: organization,
        };
    } catch (error) {
        if (error instanceof EmailAlreadyUsedError) {
            return {
                success: false,
                message: t.admin.users.errors.emailTaken,
                errors: { adminEmail: [t.admin.users.errors.emailTaken] },
            };
        }

        return {
            success: false,
            message: t.admin.platform.createFailed,
        };
    }
}

export async function updateOrganization(
    organizationId: string,
    input: unknown
): Promise<ActionResponse<OrganizationDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_EDIT");
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
        const organization = await PlatformService.updateOrganization(organizationId, parsed.data);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: t.admin.platform.updated,
            data: organization,
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError) {
            return { success: false, message: t.admin.platform.errors.notFound };
        }

        return {
            success: false,
            message: t.admin.platform.updateFailed,
        };
    }
}

export async function setOrganizationActive(
    organizationId: string,
    isActive: boolean
): Promise<ActionResponse<OrganizationDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_SUSPEND");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    try {
        const organization = await PlatformService.setOrganizationActive(organizationId, isActive);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: isActive ? t.admin.platform.reactivated : t.admin.platform.suspended,
            data: organization,
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError) {
            return { success: false, message: t.admin.platform.errors.notFound };
        }

        return {
            success: false,
            message: t.admin.platform.statusFailed,
        };
    }
}

export async function startImpersonation(
    organizationId: string
): Promise<ActionResponse<{ organizationId: string; organizationNom: string }>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_IMPERSONATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    try {
        const organization = await PlatformService.startImpersonation(organizationId);

        return {
            success: true,
            message: t.admin.platform.visiting(organization.nom),
            data: { organizationId: organization.id, organizationNom: organization.nom },
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError) {
            return { success: false, message: t.admin.platform.errors.notFound };
        }

        if (error instanceof OrganizationSuspendedError) {
            return { success: false, message: t.admin.platform.errors.suspended };
        }

        return {
            success: false,
            message: t.admin.platform.switchFailed,
        };
    }
}

export async function uploadOrganizationLogoById(
    organizationId: string,
    formData: FormData
): Promise<ActionResponse<OrganizationDTO>> {
    const { t, tv } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_EDIT");
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

        revalidatePath(ROUTES.PLATFORM);

        return { success: true, message: t.admin.settings.logo.updated, data: organization };
    } catch (error) {
        if (error instanceof OrganizationRecordNotFoundError) {
            return { success: false, message: t.admin.platform.errors.notFound };
        }

        console.error("[logo] Échec du téléversement", error);

        return { success: false, message: t.admin.settings.logo.uploadFailed };
    }
}

export async function removeOrganizationLogoById(
    organizationId: string,
    kind: unknown
): Promise<ActionResponse<OrganizationDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("ORGANIZATION_EDIT");
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

        revalidatePath(ROUTES.PLATFORM);

        return { success: true, message: t.admin.settings.logo.removed, data: organization };
    } catch (error) {
        if (error instanceof OrganizationRecordNotFoundError) {
            return { success: false, message: t.admin.platform.errors.notFound };
        }

        return { success: false, message: t.admin.settings.logo.removeFailed };
    }
}
