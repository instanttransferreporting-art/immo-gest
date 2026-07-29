"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getDashboardMetrics } from "@/features/dashboard/actions/dashboard.actions";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { AlertesSection } from "@/features/dashboard/components/AlertesSection";

export function DashboardContent() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard-metrics"],
        queryFn: async () => {
            const result = await getDashboardMetrics();

            if (!result.success || !result.data) {
                throw new Error(result.message);
            }

            return result.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error instanceof Error ? error.message : "Impossible de charger le tableau de bord."}
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <KpiCards metrics={data} />
            <AlertesSection metrics={data} />
        </div>
    );
}
