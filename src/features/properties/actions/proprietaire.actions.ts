"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { proprietaireSchema } from "@/features/properties/schemas/property.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ProprietaireDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";

export async function createProprietaire(input: unknown): Promise<ActionResponse<ProprietaireDTO>> {
    try {
        await checkPermission("PROPRIETAIRE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = proprietaireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const proprietaire = await ProprietaireService.create(parsed.data);

        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: "Propriétaire créé avec succès.",
            data: proprietaire,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création du propriétaire.",
        };
    }
}

export async function getProprietaireOptions(): Promise<ActionResponse<ProprietaireOptionDTO[]>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const options = await ProprietaireService.listOptions();

    return {
        success: true,
        message: "Liste des propriétaires récupérée avec succès.",
        data: options,
    };
}
