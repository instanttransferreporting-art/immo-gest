"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { RelanceNiveauOrderError, RelanceService } from "@/features/collections/services/relance.service";
import { genererRelanceSchema } from "@/features/collections/schemas/collection.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { RelanceDTO } from "@/features/collections/types/collection.types";

export async function genererRelance(input: unknown): Promise<ActionResponse<RelanceDTO>> {
    try {
        await checkPermission("RELANCE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = genererRelanceSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const relance = await RelanceService.genererRelance(parsed.data);

        revalidatePath(ROUTES.RECOUVREMENT);

        return {
            success: true,
            message: "Relance enregistrée avec succès.",
            data: relance,
        };
    } catch (error) {
        if (error instanceof RelanceNiveauOrderError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la génération de la relance.",
        };
    }
}
