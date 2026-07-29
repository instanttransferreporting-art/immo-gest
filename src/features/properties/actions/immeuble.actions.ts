"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { immeubleSchema } from "@/features/properties/schemas/property.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ImmeubleDTO } from "@/features/properties/types/property.types";

export async function createImmeuble(input: unknown): Promise<ActionResponse<ImmeubleDTO>> {
    try {
        await checkPermission("IMMEUBLE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = immeubleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const immeuble = await ImmeubleService.create(parsed.data);

        if (!immeuble) {
            return {
                success: false,
                message: "Le propriétaire sélectionné est introuvable.",
            };
        }

        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: "Immeuble créé avec succès.",
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'immeuble.",
        };
    }
}
