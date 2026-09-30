"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { UniteService } from "@/features/units/services/unite.service";
import { uniteSchema, uniteUpdateSchema } from "@/features/units/schemas/unit.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { UniteDTO } from "@/features/units/types/unit.types";

export async function createUnite(input: unknown): Promise<ActionResponse<UniteDTO>> {
    let user;

    try {
        user = await checkPermission("UNITE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = uniteSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const unite = await UniteService.create(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "UNITE_CREATE",
            details: `Unité "${unite.numero}" créée.`,
        });

        revalidatePath(`${ROUTES.PROPERTIES}/${parsed.data.immeubleId}`);

        return {
            success: true,
            message: "Unité créée avec succès.",
            data: unite,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'unité.",
        };
    }
}

export async function updateUnite(id: string, input: unknown): Promise<ActionResponse<UniteDTO>> {
    let user;

    try {
        user = await checkPermission("UNITE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = uniteUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const unite = await UniteService.update(id, parsed.data);

        if (!unite) {
            return {
                success: false,
                message: "L'unité est introuvable.",
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "UNITE_UPDATE",
            details: `Unité "${unite.numero}" modifiée.`,
        });

        revalidatePath(`${ROUTES.PROPERTIES}/${unite.immeubleId}`);

        return {
            success: true,
            message: "Unité mise à jour avec succès.",
            data: unite,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour de l'unité.",
        };
    }
}
