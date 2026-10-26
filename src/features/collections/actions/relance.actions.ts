"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/permissions";
import { RelanceNiveauOrderError, RelanceService } from "@/features/collections/services/relance.service";
import { genererRelanceSchema } from "@/features/collections/schemas/collection.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { RelanceDTO } from "@/features/collections/types/collection.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function genererRelance(input: unknown): Promise<ActionResponse<RelanceDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("RELANCE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = genererRelanceSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const relance = await RelanceService.genererRelance(parsed.data);

        revalidatePath(ROUTES.RECOUVREMENT);

        return {
            success: true,
            message: t.operations.collections.created,
            data: relance,
        };
    } catch (error) {
        if (error instanceof RelanceNiveauOrderError) {
            return {
                success: false,
                message: t.operations.collections.levelOrder(t.enums.niveauRelance[error.niveauRequis]),
            };
        }

        return {
            success: false,
            message: t.operations.collections.createFailed,
        };
    }
}
