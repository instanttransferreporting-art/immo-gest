import { Building2, FileText, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";

type DGDashboardProps = {
    metrics: DashboardMetricsDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function DGDashboard({ metrics }: DGDashboardProps) {
    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Vue consolidée en lecture seule — les actions de gestion ne sont pas disponibles depuis cet écran.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Nombre de biens</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{metrics.totalImmeubles}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.totalUnites} unité(s) au total
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Taux d&apos;occupation</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {percentFormatter.format(metrics.tauxOccupation)}%
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.unitesOccupees} / {metrics.totalUnites} unités occupées
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Contrats actifs</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{metrics.nombreContratsActifs}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Revenus (ce mois)</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {currencyFormatter.format(metrics.revenuMensuelEncaisse)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Revenus (12 derniers mois)</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {currencyFormatter.format(metrics.revenuAnnuelEncaisse)}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="flex items-start justify-between px-6 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Impayés (mois précédent)</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {currencyFormatter.format(metrics.totalImpayesMoisPrecedent)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.nombreFacturesImpayeesMoisPrecedent} facture(s) en attente
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
