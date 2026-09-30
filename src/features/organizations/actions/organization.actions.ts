"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { organizationSchema } from "@/features/organizations/schemas/organization.schema";
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
