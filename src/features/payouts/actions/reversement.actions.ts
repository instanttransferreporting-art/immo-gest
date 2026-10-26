"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import {
    DuplicateReversementError,
    ProprietaireNotFoundError,
    ReversementNotFoundError,
    ReversementService,
} from "@/features/payouts/services/reversement.service";
import { genererReversementSchema, validerReversementSchema } from "@/features/payouts/schemas/payout.schema";
import type { ActionResponse } from "@/types/action-response.types";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function genererReversement(input: unknown): Promise<ActionResponse<ReversementDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("REVERSEMENT_GENERER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = genererReversementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const reversement = await ReversementService.genererReversement(
            parsed.data.proprietaireId,
            parsed.data.mois,
            parsed.data.annee
        );

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "REVERSEMENT_GENERER",
            details: `Reversement ${parsed.data.mois}/${parsed.data.annee} généré pour le propriétaire ${parsed.data.proprietaireId}.`,
        });

        revalidatePath(`/proprietaires/${parsed.data.proprietaireId}/bilan`);

        return {
            success: true,
            message: t.operations.payouts.generated,
            data: reversement,
        };
    } catch (error) {
        if (error instanceof DuplicateReversementError) {
            return { success: false, message: t.operations.payouts.errors.duplicate };
        }

        if (error instanceof ProprietaireNotFoundError) {
            return { success: false, message: t.operations.payouts.errors.ownerNotFound };
        }

        return {
            success: false,
            message: t.operations.payouts.generateFailed,
        };
    }
}

export async function validerReversement(input: unknown): Promise<ActionResponse<ReversementDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("REVERSEMENT_VALIDER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = validerReversementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
        };
    }

    try {
        const reversement = await ReversementService.validerReversement(parsed.data.reversementId);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "REVERSEMENT_VALIDER",
            details: `Reversement (id: ${reversement.id}) validé.`,
        });

        revalidatePath(`/proprietaires/${reversement.proprietaireId}/bilan`);

        return {
            success: true,
            message: t.operations.payouts.approved,
            data: reversement,
        };
    } catch (error) {
        if (error instanceof ReversementNotFoundError) {
            return { success: false, message: t.operations.payouts.errors.notFound };
        }

        return {
            success: false,
            message: t.operations.payouts.approveFailed,
        };
    }
}
