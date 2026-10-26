"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import {
    CautionExceedsMontantInitialError,
    CautionNotFoundError,
    CautionService,
} from "@/features/leases/services/caution.service";
import { restitutionCautionSchema } from "@/features/leases/schemas/caution.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { CautionDTO } from "@/features/leases/types/caution.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function restituerCaution(input: unknown): Promise<ActionResponse<CautionDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CAUTION_RESTITUER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = restitutionCautionSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const caution = await CautionService.restituer(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CAUTION_RESTITUER",
            details: `Caution du contrat (id: ${caution.contratId}) restituée.`,
        });

        revalidatePath(`${ROUTES.LEASES}/${caution.contratId}`);

        return {
            success: true,
            message: t.leases.caution.updated,
            data: caution,
        };
    } catch (error) {
        if (error instanceof CautionExceedsMontantInitialError) {
            return { success: false, message: t.leases.caution.exceedsInitial };
        }

        if (error instanceof CautionNotFoundError) {
            return { success: false, message: t.leases.caution.notFound };
        }

        return {
            success: false,
            message: t.leases.caution.updateFailed,
        };
    }
}
