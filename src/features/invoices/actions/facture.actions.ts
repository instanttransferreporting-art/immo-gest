"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/permissions";
import {
    ContratNotFoundError,
    DuplicateInvoiceError,
    FactureService,
} from "@/features/invoices/services/facture.service";
import { genererFactureSchema, genererFacturesDuMoisSchema } from "@/features/invoices/schemas/invoice.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function genererFactureUnique(input: unknown): Promise<ActionResponse<FactureDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("FACTURE_GENERER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = genererFactureSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const facture = await FactureService.genererFactureMensuelle(
            parsed.data.contratId,
            parsed.data.mois,
            parsed.data.annee
        );

        revalidatePath(ROUTES.INVOICES);

        return {
            success: true,
            message: t.invoices.generated,
            data: facture,
        };
    } catch (error) {
        if (error instanceof DuplicateInvoiceError) {
            return { success: false, message: t.invoices.errors.duplicate };
        }

        if (error instanceof ContratNotFoundError) {
            return { success: false, message: t.invoices.errors.leaseNotFound };
        }

        return {
            success: false,
            message: t.invoices.generateFailed,
        };
    }
}

export async function genererFacturesDuMois(input: unknown): Promise<ActionResponse<{ crees: number; ignorees: number }>> {
    const { t } = await getI18n();

    try {
        await checkPermission("FACTURE_GENERER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = genererFacturesDuMoisSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const result = await FactureService.genererFacturesDuMois(parsed.data.mois, parsed.data.annee);

        revalidatePath(ROUTES.INVOICES);

        return {
            success: true,
            message: t.invoices.generatedMonth(result.crees, result.ignorees),
            data: result,
        };
    } catch {
        return {
            success: false,
            message: t.invoices.generateMonthFailed,
        };
    }
}
