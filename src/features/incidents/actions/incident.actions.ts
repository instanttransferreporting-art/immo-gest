"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/permissions";
import { IncidentService } from "@/features/incidents/services/incident.service";
import {
    assignPrestataireSchema,
    incidentSchema,
    updateStatutIncidentSchema,
} from "@/features/incidents/schemas/incident.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { IncidentDTO } from "@/features/incidents/types/incident.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createIncident(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("INCIDENT_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = incidentSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const incident = await IncidentService.create(parsed.data);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: t.operations.incidents.created,
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: t.operations.incidents.createFailed,
        };
    }
}

export async function updateStatutIncident(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("INCIDENT_UPDATE_STATUT");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = updateStatutIncidentSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: t.common.invalidInput };
    }

    try {
        const incident = await IncidentService.updateStatut(parsed.data.incidentId, parsed.data.statut);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: t.operations.incidents.statusUpdated,
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: t.operations.incidents.statusFailed,
        };
    }
}

export async function assignPrestataire(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("INCIDENT_ASSIGN_PRESTATAIRE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = assignPrestataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const incident = await IncidentService.assignPrestataire(parsed.data.incidentId, parsed.data.prestataire);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: t.operations.incidents.providerAssigned,
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: t.operations.incidents.providerFailed,
        };
    }
}
