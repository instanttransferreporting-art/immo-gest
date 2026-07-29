"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import {
    CautionExceedsMontantInitialError,
    CautionNotFoundError,
    CautionService,
} from "@/features/leases/services/caution.service";
import { restitutionCautionSchema } from "@/features/leases/schemas/caution.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { CautionDTO } from "@/features/leases/types/caution.types";

export async function restituerCaution(input: unknown): Promise<ActionResponse<CautionDTO>> {
    try {
        await checkPermission("CAUTION_RESTITUER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = restitutionCautionSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const caution = await CautionService.restituer(parsed.data);

        revalidatePath(`${ROUTES.LEASES}/${caution.contratId}`);

        return {
            success: true,
            message: "Caution mise à jour avec succès.",
            data: caution,
        };
    } catch (error) {
        if (error instanceof CautionExceedsMontantInitialError || error instanceof CautionNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour de la caution.",
        };
    }
}
