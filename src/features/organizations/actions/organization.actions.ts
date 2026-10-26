"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { logoFileSchema, logoKindSchema, organizationSchema } from "@/features/organizations/schemas/organization.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";

export async function updateOrganization(input: unknown): Promise<ActionResponse<OrganizationDTO>> {
    try {
        await checkPermission("ORGANIZATION_MANAGE");
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
        const organization = await OrganizationService.update(parsed.data);

        revalidatePath(ROUTES.SETTINGS);

        return {
            success: true,
            message: "Paramètres de l'agence mis à jour avec succès.",
            data: organization,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour des paramètres.",
        };
    }
}

export async function uploadOrganizationLogo(formData: FormData): Promise<ActionResponse<OrganizationDTO>> {
    let organizationId: string;

    try {
        organizationId = effectiveOrganizationId(await checkPermission("ORGANIZATION_MANAGE"));
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = logoFileSchema.safeParse(formData.get("logo"));
    const parsedKind = logoKindSchema.safeParse(formData.get("kind"));

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Fichier invalide." };
    }

    if (!parsedKind.success) {
        return { success: false, message: "Type de logo invalide." };
    }

    try {
        const organization = await OrganizationService.updateLogo(organizationId, parsedKind.data, parsed.data);

        // Le logo apparaît dans la barre latérale de toutes les pages.
        revalidatePath("/", "layout");

        return { success: true, message: "Logo mis à jour avec succès.", data: organization };
    } catch (error) {
        console.error("[logo] Échec du téléversement", error);

        return { success: false, message: "Une erreur est survenue lors du téléversement du logo." };
    }
}

export async function removeOrganizationLogo(kind: unknown): Promise<ActionResponse<OrganizationDTO>> {
    let organizationId: string;

    try {
        organizationId = effectiveOrganizationId(await checkPermission("ORGANIZATION_MANAGE"));
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsedKind = logoKindSchema.safeParse(kind);

    if (!parsedKind.success) {
        return { success: false, message: "Type de logo invalide." };
    }

    try {
        const organization = await OrganizationService.removeLogo(organizationId, parsedKind.data);

        revalidatePath("/", "layout");

        return { success: true, message: "Logo retiré.", data: organization };
    } catch {
        return { success: false, message: "Une erreur est survenue lors de la suppression du logo." };
    }
}
