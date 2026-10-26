"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { proprietaireSchema } from "@/features/properties/schemas/property.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ProprietaireDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createProprietaire(input: unknown): Promise<ActionResponse<ProprietaireDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("PROPRIETAIRE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = proprietaireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const proprietaire = await ProprietaireService.create(parsed.data);

        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: t.properties.owners.created,
            data: proprietaire,
        };
    } catch {
        return {
            success: false,
            message: t.properties.owners.createFailed,
        };
    }
}

export async function getProprietaireOptions(): Promise<ActionResponse<ProprietaireOptionDTO[]>> {
    const { t } = await getI18n();

    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: t.common.errors.unauthenticated };
    }

    const options = await ProprietaireService.listOptions();

    return {
        success: true,
        message: "OK",
        data: options,
    };
}
