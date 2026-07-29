"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import {
    DuplicateReversementError,
    ProprietaireNotFoundError,
    ReversementNotFoundError,
    ReversementService,
} from "@/features/payouts/services/reversement.service";
import { genererReversementSchema, validerReversementSchema } from "@/features/payouts/schemas/payout.schema";
import type { ActionResponse } from "@/types/action-response.types";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";

export async function genererReversement(input: unknown): Promise<ActionResponse<ReversementDTO>> {
    try {
        await checkPermission("REVERSEMENT_GENERER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = genererReversementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const reversement = await ReversementService.genererReversement(
            parsed.data.proprietaireId,
            parsed.data.mois,
            parsed.data.annee
        );

        revalidatePath(`/proprietaires/${parsed.data.proprietaireId}/bilan`);

        return {
            success: true,
            message: "Reversement généré avec succès.",
            data: reversement,
        };
    } catch (error) {
        if (error instanceof DuplicateReversementError || error instanceof ProprietaireNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la génération du reversement.",
        };
    }
}

export async function validerReversement(input: unknown): Promise<ActionResponse<ReversementDTO>> {
    try {
        await checkPermission("REVERSEMENT_VALIDER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = validerReversementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
        };
    }

    try {
        const reversement = await ReversementService.validerReversement(parsed.data.reversementId);

        revalidatePath(`/proprietaires/${reversement.proprietaireId}/bilan`);

        return {
            success: true,
            message: "Reversement validé avec succès.",
            data: reversement,
        };
    } catch (error) {
        if (error instanceof ReversementNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la validation du reversement.",
        };
    }
}
