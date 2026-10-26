"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import {
    ContratNotActifError,
    ContratNotFoundError,
    ContratService,
    ContratStatutInvalideError,
    UniteNotAvailableError,
} from "@/features/leases/services/contrat.service";
import {
    contratSchema,
    renouvellementSchema,
    resiliationSchema,
    suspensionSchema,
} from "@/features/leases/schemas/lease.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { ContratDTO } from "@/features/leases/types/lease.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CONTRAT_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = contratSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const contrat = await ContratService.create(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_CREATE",
            details: `Contrat "${contrat.numeroContrat}" créé.`,
        });

        revalidatePath(ROUTES.LEASES);
        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: t.leases.messages.created,
            data: contrat,
        };
    } catch (error) {
        if (error instanceof UniteNotAvailableError) {
            return {
                success: false,
                message: t.leases.errors.unitNotAvailable,
                errors: { uniteId: [t.leases.errors.unitNotAvailable] },
            };
        }

        return {
            success: false,
            message: t.leases.messages.createFailed,
        };
    }
}

export async function resilierContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = resiliationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const contrat = await ContratService.resilierContrat(parsed.data);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_RESILIER",
            details: `Contrat "${contrat.numeroContrat}" résilié.`,
        });

        revalidatePath(`${ROUTES.LEASES}/${parsed.data.contratId}`);
        revalidatePath(ROUTES.LEASES);
        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: t.leases.messages.terminated,
            data: contrat,
        };
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return { success: false, message: t.leases.errors.notFound };
        }

        if (error instanceof ContratNotActifError) {
            return { success: false, message: t.leases.errors.notActive };
        }

        return {
            success: false,
            message: t.leases.messages.terminateFailed,
        };
    }
}

export async function suspendreContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = suspensionSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: t.common.invalidInput };
    }

    try {
        const contrat = await ContratService.suspendreContrat(parsed.data.contratId);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_SUSPENDRE",
            details: `Contrat "${contrat.numeroContrat}" suspendu.`,
        });

        revalidatePath(`${ROUTES.LEASES}/${parsed.data.contratId}`);
        revalidatePath(ROUTES.LEASES);

        return { success: true, message: t.leases.messages.suspended, data: contrat };
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return { success: false, message: t.leases.errors.notFound };
        }

        if (error instanceof ContratStatutInvalideError) {
            return { success: false, message: t.leases.errors[error.code] };
        }

        return { success: false, message: t.leases.messages.suspendFailed };
    }
}

export async function reactiverContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = suspensionSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: t.common.invalidInput };
    }

    try {
        const contrat = await ContratService.reactiverContrat(parsed.data.contratId);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_REACTIVER",
            details: `Contrat "${contrat.numeroContrat}" réactivé.`,
        });

        revalidatePath(`${ROUTES.LEASES}/${parsed.data.contratId}`);
        revalidatePath(ROUTES.LEASES);

        return { success: true, message: t.leases.messages.reactivated, data: contrat };
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return { success: false, message: t.leases.errors.notFound };
        }

        if (error instanceof ContratStatutInvalideError) {
            return { success: false, message: t.leases.errors[error.code] };
        }

        return { success: false, message: t.leases.messages.reactivateFailed };
    }
}

export async function renouvelerContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = renouvellementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const contrat = await ContratService.renouvelerContrat(parsed.data.contratId, {
            loyerBase: parsed.data.loyerBase,
            charges: parsed.data.charges,
            depotGarantie: parsed.data.depotGarantie,
        });

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_RENOUVELER",
            details: `Contrat "${contrat.numeroContrat}" créé par renouvellement.`,
        });

        revalidatePath(`${ROUTES.LEASES}/${parsed.data.contratId}`);
        revalidatePath(ROUTES.LEASES);
        revalidatePath(ROUTES.PROPERTIES);

        return {
            success: true,
            message: t.leases.messages.renewed(contrat.numeroContrat),
            data: contrat,
        };
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return { success: false, message: t.leases.errors.notFound };
        }

        if (error instanceof ContratStatutInvalideError) {
            return { success: false, message: t.leases.errors[error.code] };
        }

        return { success: false, message: t.leases.messages.renewFailed };
    }
}
