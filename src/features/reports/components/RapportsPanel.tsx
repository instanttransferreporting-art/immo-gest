"use client";

import { Download, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { REPORT_CATEGORY_LABELS, REPORT_DEFINITIONS } from "@/features/reports/constants/report.constants";
import type { PerformanceSummaryDTO, ReportCategory, ReportSummaryDTO } from "@/features/reports/types/report.types";

type RapportsPanelProps = {
    summaries: ReportSummaryDTO[];
    performance: PerformanceSummaryDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

const CATEGORIES: ReportCategory[] = ["LOCATIFS", "FINANCIERS", "PERFORMANCE"];

function ReportCard({ summary }: { summary: ReportSummaryDTO }) {
    const definition = REPORT_DEFINITIONS.find((item) => item.type === summary.type);

    if (!definition) {
        return null;
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="flex flex-col gap-3 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FileText className="h-5 w-5" />
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-foreground">{definition.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{definition.description}</p>
                </div>

                <div>
                    <p className="text-xl font-bold text-foreground">
                        {definition.isAmount && summary.total !== null
                            ? currencyFormatter.format(summary.total)
                            : summary.count}
                    </p>
                    {definition.isAmount && (
                        <p className="text-xs text-muted-foreground">{summary.count} élément(s)</p>
                    )}
                </div>

                <Button
                    render={<a href={`/api/export/rapport?reportType=${summary.type}`} />}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    nativeButton={false}
                >
                    <Download className="h-4 w-4" />
                    Exporter (Excel)
                </Button>
            </CardContent>
        </Card>
    );
}

function PerformanceContent({ performance }: { performance: PerformanceSummaryDTO }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">Total facturé</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {currencyFormatter.format(performance.rentabiliteGlobale.totalFacture)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">Total encaissé</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {currencyFormatter.format(performance.rentabiliteGlobale.totalEncaisse)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {percentFormatter.format(performance.rentabiliteGlobale.tauxRecouvrement)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="px-6 py-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">Taux d&apos;occupation par immeuble</p>

                    {performance.occupationParImmeuble.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun immeuble enregistré.</p>
                    ) : (
                        <div className="space-y-2">
                            {performance.occupationParImmeuble.map((immeuble) => (
                                <div
                                    key={immeuble.immeubleId}
                                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                                >
                                    <span className="text-foreground">{immeuble.immeubleNom}</span>
                                    <span className="text-muted-foreground">
                                        {immeuble.unitesOccupees} / {immeuble.totalUnites} unités —{" "}
                                        <span className="font-medium text-foreground">
                                            {percentFormatter.format(immeuble.tauxOccupation)}%
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="px-6 py-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        Rendement par immeuble (revenu encaissé / 12 mois vs. valeur estimative)
                    </p>

                    {performance.rendementParImmeuble.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun immeuble enregistré.</p>
                    ) : (
                        <div className="space-y-2">
                            {performance.rendementParImmeuble.map((immeuble) => (
                                <div
                                    key={immeuble.immeubleId}
                                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                                >
                                    <span className="text-foreground">{immeuble.immeubleNom}</span>
                                    <span className="text-muted-foreground">
                                        {currencyFormatter.format(immeuble.revenuAnnuelEncaisse)} / an —{" "}
                                        <span className="font-medium text-foreground">
                                            {immeuble.rendement !== null
                                                ? `${percentFormatter.format(immeuble.rendement)}%`
                                                : "N/A (valeur estimative manquante)"}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export function RapportsPanel({ summaries, performance }: RapportsPanelProps) {
    return (
        <Tabs defaultValue="LOCATIFS">
            <TabsList>
                {CATEGORIES.map((category) => (
                    <TabsTab key={category} value={category}>
                        {REPORT_CATEGORY_LABELS[category]}
                    </TabsTab>
                ))}
            </TabsList>

            {CATEGORIES.map((category) => (
                <TabsPanel key={category} value={category}>
                    {category === "PERFORMANCE" ? (
                        <PerformanceContent performance={performance} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {summaries
                                .filter((summary) => REPORT_DEFINITIONS.find((d) => d.type === summary.type)?.category === category)
                                .map((summary) => (
                                    <ReportCard key={summary.type} summary={summary} />
                                ))}
                        </div>
                    )}
                </TabsPanel>
            ))}
        </Tabs>
    );
}
