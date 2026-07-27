"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { UniteService } from "@/features/units/services/unite.service";
import { uniteSchema } from "@/features/units/schemas/unit.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { UniteDTO } from "@/features/units/types/unit.types";

export async function createUnite(input: unknown): Promise<ActionResponse<UniteDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = uniteSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const unite = await UniteService.create(parsed.data);

        revalidatePath(`${ROUTES.PROPERTIES}/${parsed.data.immeubleId}`);

        return {
            success: true,
            message: "Unité créée avec succès.",
            data: unite,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'unité.",
        };
    }
}
