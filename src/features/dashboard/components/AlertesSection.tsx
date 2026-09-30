import Link from "next/link";
import { CheckCircle2, Receipt, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { PRIORITE_INCIDENT_LABELS, PRIORITE_INCIDENT_STYLES } from "@/features/incidents/constants/incident.constants";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";

type AlertesSectionProps = {
    metrics: DashboardMetricsDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function AlertesSection({ metrics }: AlertesSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Factures impayées urgentes
                    </CardTitle>
                    <Link href={ROUTES.INVOICES} className="text-sm text-emerald-700 hover:underline">
                        Voir tout
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.facturesImpayeesUrgentes.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <p className="text-sm text-muted-foreground">Aucune facture impayée en attente.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {metrics.facturesImpayeesUrgentes.map((facture) => (
                                <li key={facture.id}>
                                    <Link
                                        href={`${ROUTES.INVOICES}/${facture.id}`}
                                        className="flex items-center justify-between gap-3 py-3 hover:text-emerald-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {facture.locataireNom}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {facture.uniteLabel} · échéance {dateFormatter.format(facture.dateEcheance)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            {currencyFormatter.format(facture.totalDu)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Incidents non résolus
                    </CardTitle>
                    <Link href={ROUTES.INCIDENTS} className="text-sm text-emerald-700 hover:underline">
                        Voir tout
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.incidentsNonResolus.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <p className="text-sm text-muted-foreground">Aucun incident en cours.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {metrics.incidentsNonResolus.map((incident) => (
                                <li key={incident.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <Wrench className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{incident.titre}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {incident.localisation ?? "Non localisé"} ·{" "}
                                                {dateFormatter.format(incident.dateSignalement)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={`rounded-lg ${PRIORITE_INCIDENT_STYLES[incident.priorite]}`}>
                                        {PRIORITE_INCIDENT_LABELS[incident.priorite]}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
