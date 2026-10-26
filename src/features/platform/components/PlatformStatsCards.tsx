"use client";

import { Building2, Home, Layers, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PlatformStatsDTO } from "@/features/platform/types/platform.types";
import { useI18n } from "@/i18n/client";

type PlatformStatsCardsProps = {
    stats: PlatformStatsDTO;
};

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
    const { t } = useI18n();

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-muted-foreground">{t.admin.platform.stats.organizations}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalOrganizations}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Building2 className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-muted-foreground">{t.admin.platform.stats.buildings}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalImmeubles}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Home className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-muted-foreground">{t.admin.platform.stats.units}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalUnites}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Layers className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="flex items-start justify-between px-6 py-2">
                    <div>
                        <p className="text-sm text-muted-foreground">{t.admin.platform.stats.users}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Users className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
