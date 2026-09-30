"use server";

import { getCurrentSession } from "@/lib/auth";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import type { ActionResponse } from "@/types/action-response.types";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";

export async function getDashboardMetrics(): Promise<ActionResponse<DashboardMetricsDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    try {
        const metrics = await DashboardService.getMetrics();

        return {
            success: true,
            message: "Métriques récupérées avec succès.",
            data: metrics,
        };
    } catch {
        return {
            success: false,
            message: "Une erreur est survenue lors du chargement des métriques.",
        };
    }
}
