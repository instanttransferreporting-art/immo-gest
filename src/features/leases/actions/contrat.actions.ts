"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import {
    ContratNotActifError,
    ContratNotFoundError,
    ContratService,
    UniteNotAvailableError,
} from "@/features/leases/services/contrat.service";
import { contratSchema, resiliationSchema } from "@/features/leases/schemas/lease.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ContratDTO } from "@/features/leases/types/lease.types";

export async function createContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    try {
        await checkPermission("CONTRAT_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
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

export async function resilierContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    try {
        await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = resiliationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const contrat = await ContratService.resilierContrat(parsed.data);

        revalidatePath(`${ROUTES.LEASES}/${parsed.data.contratId}`);
        revalidatePath(ROUTES.LEASES);
        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: "Contrat résilié avec succès. L'unité est de nouveau disponible.",
            data: contrat,
        };
    } catch (error) {
        if (error instanceof ContratNotFoundError || error instanceof ContratNotActifError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la résiliation du contrat.",
        };
    }
}
