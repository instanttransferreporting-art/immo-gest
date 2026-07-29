import { Building2, Home, Layers, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PlatformStatsDTO } from "@/features/platform/types/platform.types";

type PlatformStatsCardsProps = {
    stats: PlatformStatsDTO;
};

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-slate-500">Entreprises</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalOrganizations}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Building2 className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-slate-500">Immeubles (total)</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalImmeubles}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Home className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-slate-500">Unités (total)</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUnites}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Layers className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-slate-500">Utilisateurs (total)</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Users className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
