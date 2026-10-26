import Link from "next/link";
import { CalendarClock, CheckCircle2, Home, Receipt, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { PRIORITE_INCIDENT_STYLES } from "@/features/incidents/constants/incident.constants";
import type { DashboardMetricsDTO } from "@/features/dashboard/types/dashboard.types";
import { useI18n } from "@/i18n/client";

type AlertesSectionProps = {
    metrics: DashboardMetricsDTO;
};

export function AlertesSection({ metrics }: AlertesSectionProps) {
    const { t, f } = useI18n();

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">
                        {t.dashboard.alerts.urgentUnpaid}
                    </CardTitle>
                    <Link href={ROUTES.INVOICES} className="text-sm text-brand-700 hover:underline">
                        {t.dashboard.seeAll}
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.facturesImpayeesUrgentes.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-brand-500" />
                            <p className="text-sm text-muted-foreground">{t.dashboard.alerts.noUnpaid}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {metrics.facturesImpayeesUrgentes.map((facture) => (
                                <li key={facture.id}>
                                    <Link
                                        href={`${ROUTES.INVOICES}/${facture.id}`}
                                        className="flex items-center justify-between gap-3 py-3 hover:text-brand-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {facture.locataireNom}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {facture.uniteLabel} · {t.dashboard.alerts.dueOn(f.date(facture.dateEcheance))}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            {f.currency(facture.totalDu)}
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
                        {t.dashboard.alerts.openIncidents}
                    </CardTitle>
                    <Link href={ROUTES.INCIDENTS} className="text-sm text-brand-700 hover:underline">
                        {t.dashboard.seeAll}
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.incidentsNonResolus.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-brand-500" />
                            <p className="text-sm text-muted-foreground">{t.dashboard.alerts.noIncidents}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {metrics.incidentsNonResolus.map((incident) => (
                                <li key={incident.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <Wrench className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{incident.titre}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {incident.localisation ?? t.dashboard.alerts.notLocated} ·{" "}
                                                {f.date(incident.dateSignalement)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={`rounded-lg ${PRIORITE_INCIDENT_STYLES[incident.priorite]}`}>
                                        {t.enums.prioriteIncident[incident.priorite]}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">
                        {t.dashboard.alerts.expiringLeases}
                    </CardTitle>
                    <Link href={ROUTES.LEASES} className="text-sm text-brand-700 hover:underline">
                        {t.dashboard.seeAll}
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.contratsArrivantEcheance.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-brand-500" />
                            <p className="text-sm text-muted-foreground">{t.dashboard.alerts.noExpiringLeases}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {metrics.contratsArrivantEcheance.map((contrat) => (
                                <li key={contrat.id}>
                                    <Link
                                        href={`${ROUTES.LEASES}/${contrat.id}`}
                                        className="flex items-center justify-between gap-3 py-3 hover:text-brand-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {contrat.locataireNom}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{contrat.uniteLabel}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            {f.date(contrat.dateFin)}
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
                    <CardTitle className="text-base font-semibold text-foreground">{t.dashboard.alerts.vacantUnits}</CardTitle>
                    <Link href={ROUTES.PROPERTIES} className="text-sm text-brand-700 hover:underline">
                        {t.dashboard.seeAll}
                    </Link>
                </CardHeader>

                <CardContent className="px-6">
                    {metrics.logementsVacants.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-brand-500" />
                            <p className="text-sm text-muted-foreground">{t.dashboard.alerts.noVacantUnits}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {metrics.logementsVacants.map((unite) => (
                                <li key={unite.id} className="flex items-center gap-3 py-3">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">
                                        {unite.immeubleNom} — {unite.numero}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
