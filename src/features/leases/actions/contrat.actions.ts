"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
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

export async function createContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    let user;

    try {
        user = await checkPermission("CONTRAT_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = contratSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
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
            message: "Contrat créé avec succès.",
            data: contrat,
        };
    } catch (error) {
        if (error instanceof UniteNotAvailableError) {
            return {
                success: false,
                message: error.message,
                errors: { uniteId: [error.message] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la création du contrat.",
        };
    }
}

export async function resilierContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = resiliationSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
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
            message: "Contrat résilié avec succès. L'unité est de nouveau disponible.",
            data: contrat,
        };
    } catch (error) {
        if (error instanceof ContratNotFoundError || error instanceof ContratNotActifError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la résiliation du contrat.",
        };
    }
}

export async function suspendreContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = suspensionSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: "Les informations saisies sont invalides." };
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

        return { success: true, message: "Contrat suspendu avec succès.", data: contrat };
    } catch (error) {
        if (error instanceof ContratNotFoundError || error instanceof ContratStatutInvalideError) {
            return { success: false, message: error.message };
        }

        return { success: false, message: "Une erreur est survenue lors de la suspension du contrat." };
    }
}

export async function reactiverContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = suspensionSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: "Les informations saisies sont invalides." };
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

        return { success: true, message: "Contrat réactivé avec succès.", data: contrat };
    } catch (error) {
        if (error instanceof ContratNotFoundError || error instanceof ContratStatutInvalideError) {
            return { success: false, message: error.message };
        }

        return { success: false, message: "Une erreur est survenue lors de la réactivation du contrat." };
    }
}

export async function renouvelerContrat(input: unknown): Promise<ActionResponse<ContratDTO>> {
    let user;

    try {
        user = await checkPermission("CONTRAT_RESILIER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = renouvellementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
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
            message: `Contrat renouvelé avec succès (nouveau contrat ${contrat.numeroContrat}).`,
            data: contrat,
        };
    } catch (error) {
        if (error instanceof ContratNotFoundError || error instanceof ContratStatutInvalideError) {
            return { success: false, message: error.message };
        }

        return { success: false, message: "Une erreur est survenue lors du renouvellement du contrat." };
    }
}
