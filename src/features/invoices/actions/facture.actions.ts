"use server";

import { revalidatePath } from "next/cache";

import { UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import {
    ContratNotFoundError,
    DuplicateInvoiceError,
    FactureService,
} from "@/features/invoices/services/facture.service";
import { genererFactureSchema, genererFacturesDuMoisSchema } from "@/features/invoices/schemas/invoice.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";

export async function genererFactureUnique(input: unknown): Promise<ActionResponse<FactureDTO>> {
    try {
        await checkPermission("FACTURE_GENERER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = genererFactureSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
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
            message: "Facture générée avec succès.",
            data: facture,
        };
    } catch (error) {
        if (error instanceof DuplicateInvoiceError || error instanceof ContratNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la génération de la facture.",
        };
    }
}

export async function genererFacturesDuMois(input: unknown): Promise<ActionResponse<{ crees: number; ignorees: number }>> {
    try {
        await checkPermission("FACTURE_GENERER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = genererFacturesDuMoisSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const result = await FactureService.genererFacturesDuMois(parsed.data.mois, parsed.data.annee);

        revalidatePath(ROUTES.INVOICES);

        return {
            success: true,
            message: `${result.crees} facture(s) créée(s), ${result.ignorees} déjà existante(s) ignorée(s).`,
            data: result,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la génération des factures.",
        };
    }
}
