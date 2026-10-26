"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { LocataireService } from "@/features/tenants/services/locataire.service";
import { locataireSchema } from "@/features/tenants/schemas/tenant.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export async function createLocataire(input: unknown): Promise<ActionResponse<LocataireDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("LOCATAIRE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = locataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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
            message: t.tenants.created,
            data: locataire,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
            return {
                success: false,
                message: t.tenants.emailTaken,
                errors: { email: [t.tenants.emailTakenShort] },
            };
        }

        return {
            success: false,
            message: t.tenants.createFailed,
        };
    }
}

export async function updateLocataire(id: string, input: unknown): Promise<ActionResponse<LocataireDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("LOCATAIRE_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = locataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const locataire = await LocataireService.update(id, parsed.data);

        if (!locataire) {
            return {
                success: false,
                message: t.tenants.notFound,
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
            message: t.tenants.updated,
            data: locataire,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
            return {
                success: false,
                message: t.tenants.emailTaken,
                errors: { email: [t.tenants.emailTakenShort] },
            };
        }

        return {
            success: false,
            message: t.tenants.updateFailed,
        };
    }
}
