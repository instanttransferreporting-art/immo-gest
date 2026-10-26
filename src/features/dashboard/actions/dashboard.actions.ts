"use server";

import { getCurrentSession } from "@/lib/auth";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import type { ActionResponse } from "@/types/action-response.types";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";
import { getI18n } from "@/i18n/server";

export async function getDashboardMetrics(): Promise<ActionResponse<DashboardMetricsDTO>> {
    const [session, { t }] = await Promise.all([getCurrentSession(), getI18n()]);

    if (!session) {
        return { success: false, message: t.common.errors.unauthenticated };
    }

    try {
        const metrics = await DashboardService.getMetrics();

        return {
            success: true,
            message: "OK",
            data: metrics,
        };
    } catch {
        return {
            success: false,
            message: t.dashboard.loadFailed,
        };
    }
}
