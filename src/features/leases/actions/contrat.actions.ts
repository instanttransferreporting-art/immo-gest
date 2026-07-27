"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { ContratService, UniteNotAvailableError } from "@/features/leases/services/contrat.service";
import { contratSchema } from "@/features/leases/schemas/lease.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ContratDTO } from "@/features/leases/types/lease.types";

export async function createContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = contratSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const contrat = await ContratService.create(parsed.data);

        revalidatePath(ROUTES.LEASES);
        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: "Contrat créé avec succès.",
            data: contrat,
        };
    } catch (error) {
        if (error instanceof UniteNotAvailableError) {
            return {
                success: false,
                message: error.message,
                errors: { uniteId: [error.message] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la création du contrat.",
        };
    }
}
