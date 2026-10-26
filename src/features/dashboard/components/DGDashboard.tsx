import { Building2, FileText, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";
import { useI18n } from "@/i18n/client";

type DGDashboardProps = {
    metrics: DashboardMetricsDTO;
};

export function DGDashboard({ metrics }: DGDashboardProps) {
    const { t, f } = useI18n();

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                {t.dashboard.dgReadOnly}
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.propertiesCount}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{metrics.totalImmeubles}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t.dashboard.kpi.totalUnits(metrics.totalUnites)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.occupancy}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {f.percent(metrics.tauxOccupation)}%
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t.dashboard.kpi.occupiedUnits(metrics.unitesOccupees, metrics.totalUnites)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.activeLeases}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{metrics.nombreContratsActifs}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.revenueThisMonth}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {f.currency(metrics.revenuMensuelEncaisse)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.revenueLast12Months}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {f.currency(metrics.revenuAnnuelEncaisse)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.dashboard.kpi.unpaidLastMonth}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {f.currency(metrics.totalImpayesMoisPrecedent)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t.dashboard.kpi.pendingInvoices(metrics.nombreFacturesImpayeesMoisPrecedent)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
