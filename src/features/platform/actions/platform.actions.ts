"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { EmailAlreadyUsedError } from "@/features/auth/services/auth.service";
import { organizationSchema } from "@/features/organizations/schemas/organization.schema";
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

export async function createOrganization(input: unknown): Promise<ActionResponse<OrganizationSummaryDTO>> {
    try {
        await checkPermission("ORGANIZATION_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = createOrganizationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const organization = await PlatformService.createOrganization(parsed.data);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: "Entreprise créée avec succès.",
            data: organization,
        };
    } catch (error) {
        if (error instanceof EmailAlreadyUsedError) {
            return {
                success: false,
                message: error.message,
                errors: { adminEmail: [error.message] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'entreprise.",
        };
    }
}

export async function updateOrganization(
    organizationId: string,
    input: unknown
): Promise<ActionResponse<OrganizationDTO>> {
    try {
        await checkPermission("ORGANIZATION_EDIT");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = organizationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const organization = await PlatformService.updateOrganization(organizationId, parsed.data);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: "Entreprise mise à jour avec succès.",
            data: organization,
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour de l'entreprise.",
        };
    }
}

export async function setOrganizationActive(
    organizationId: string,
    isActive: boolean
): Promise<ActionResponse<OrganizationDTO>> {
    try {
        await checkPermission("ORGANIZATION_SUSPEND");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    try {
        const organization = await PlatformService.setOrganizationActive(organizationId, isActive);

        revalidatePath(ROUTES.PLATFORM);

        return {
            success: true,
            message: isActive ? "Entreprise réactivée avec succès." : "Entreprise suspendue avec succès.",
            data: organization,
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour du statut de l'entreprise.",
        };
    }
}

export async function startImpersonation(
    organizationId: string
): Promise<ActionResponse<{ organizationId: string; organizationNom: string }>> {
    try {
        await checkPermission("ORGANIZATION_IMPERSONATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    try {
        const organization = await PlatformService.startImpersonation(organizationId);

        return {
            success: true,
            message: `Vous visitez maintenant ${organization.nom}.`,
            data: { organizationId: organization.id, organizationNom: organization.nom },
        };
    } catch (error) {
        if (error instanceof OrganizationNotFoundError || error instanceof OrganizationSuspendedError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors du basculement sur cette entreprise.",
        };
    }
}
