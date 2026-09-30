"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { immeubleSchema } from "@/features/properties/schemas/property.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ImmeubleDTO } from "@/features/properties/types/property.types";

export async function createImmeuble(input: unknown): Promise<ActionResponse<ImmeubleDTO>> {
    let user;

    try {
        user = await checkPermission("IMMEUBLE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = immeubleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const immeuble = await ImmeubleService.create(parsed.data);

        if (!immeuble) {
            return {
                success: false,
                message: "Le propriétaire sélectionné est introuvable.",
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_CREATE",
            details: `Immeuble "${immeuble.nom}" (${immeuble.reference}) créé.`,
        });

        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: "Immeuble créé avec succès.",
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'immeuble.",
        };
    }
}

export async function updateImmeuble(id: string, input: unknown): Promise<ActionResponse<ImmeubleDTO>> {
    let user;

    try {
        user = await checkPermission("IMMEUBLE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = immeubleSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const immeuble = await ImmeubleService.update(id, parsed.data);

        if (!immeuble) {
            return {
                success: false,
                message: "L'immeuble est introuvable.",
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_UPDATE",
            details: `Immeuble "${immeuble.nom}" (${immeuble.reference}) modifié.`,
        });

        revalidatePath(ROUTES.PROPERTIES);
        revalidatePath(`${ROUTES.PROPERTIES}/${id}`);

        return {
            success: true,
            message: "Immeuble mis à jour avec succès.",
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour de l'immeuble.",
        };
    }
}

export async function deleteImmeuble(id: string): Promise<ActionResponse<void>> {
    let user;

    try {
        user = await checkPermission("IMMEUBLE_DELETE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    try {
        const immeuble = await ImmeubleService.delete(id);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "IMMEUBLE_DELETE",
            details: `Immeuble (id: ${id}) supprimé.`,
        });

        revalidatePath(ROUTES.PROPERTIES);
        revalidatePath(`${ROUTES.PROPERTIES}/${id}`);

        return {
            success: true,
            message: "Immeuble mis à jour avec succès.",
            data: immeuble,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour de l'immeuble.",
        };
    }
}
