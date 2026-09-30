"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { LocataireService } from "@/features/tenants/services/locataire.service";
import { locataireSchema } from "@/features/tenants/schemas/tenant.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export async function createLocataire(input: unknown): Promise<ActionResponse<LocataireDTO>> {
    let user;

    try {
        user = await checkPermission("LOCATAIRE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = locataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const locataire = await LocataireService.create(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "LOCATAIRE_CREATE",
            details: `Locataire "${locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`}" créé.`,
        });

        revalidatePath(ROUTES.TENANTS);

        return {
            success: true,
            message: "Locataire créé avec succès.",
            data: locataire,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
            return {
                success: false,
                message: "Cet email est déjà utilisé par un autre locataire.",
                errors: { email: ["Cet email est déjà utilisé."] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la création du locataire.",
        };
    }
}

export async function updateLocataire(id: string, input: unknown): Promise<ActionResponse<LocataireDTO>> {
    let user;

    try {
        user = await checkPermission("LOCATAIRE_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = locataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const locataire = await LocataireService.update(id, parsed.data);

        if (!locataire) {
            return {
                success: false,
                message: "Le locataire est introuvable.",
            };
        }

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "LOCATAIRE_UPDATE",
            details: `Locataire "${locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`}" modifié.`,
        });

        revalidatePath(ROUTES.TENANTS);

        return {
            success: true,
            message: "Locataire mis à jour avec succès.",
            data: locataire,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
            return {
                success: false,
                message: "Cet email est déjà utilisé par un autre locataire.",
                errors: { email: ["Cet email est déjà utilisé."] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour du locataire.",
        };
    }
}
