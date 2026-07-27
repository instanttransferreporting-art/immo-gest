"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { IncidentService } from "@/features/incidents/services/incident.service";
import {
    assignPrestataireSchema,
    incidentSchema,
    updateStatutIncidentSchema,
} from "@/features/incidents/schemas/incident.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { IncidentDTO } from "@/features/incidents/types/incident.types";

export async function createIncident(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = incidentSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const incident = await IncidentService.create(parsed.data);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: "Incident signalé avec succès.",
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la création de l'incident.",
        };
    }
}

export async function updateStatutIncident(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = updateStatutIncidentSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: "Les informations saisies sont invalides." };
    }

    try {
        const incident = await IncidentService.updateStatut(parsed.data.incidentId, parsed.data.statut);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: "Statut de l'incident mis à jour.",
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de la mise à jour du statut.",
        };
    }
}

export async function assignPrestataire(input: unknown): Promise<ActionResponse<IncidentDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = assignPrestataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const incident = await IncidentService.assignPrestataire(parsed.data.incidentId, parsed.data.prestataire);

        revalidatePath(ROUTES.INCIDENTS);

        return {
            success: true,
            message: "Prestataire assigné avec succès.",
            data: incident,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors de l'assignation du prestataire.",
        };
    }
}
