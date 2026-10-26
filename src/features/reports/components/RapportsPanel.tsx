"use client";

import { Download, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { REPORT_CATEGORIES, REPORT_DEFINITIONS } from "@/features/reports/constants/report.constants";
import type { PerformanceSummaryDTO, ReportSummaryDTO } from "@/features/reports/types/report.types";
import { useI18n } from "@/i18n/client";

type RapportsPanelProps = {
    summaries: ReportSummaryDTO[];
    performance: PerformanceSummaryDTO;
    /** Paramètres d'URL de la période (du/au), repris dans les liens d'export. */
    periodQuery: string;
};


function ReportCard({ summary, periodQuery }: { summary: ReportSummaryDTO; periodQuery: string }) {
    const { t, f } = useI18n();

    const definition = REPORT_DEFINITIONS.find((item) => item.type === summary.type);

    if (!definition) {
        return null;
    }

    const labels = t.reports.definitions[definition.type];

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="flex flex-col gap-3 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <FileText className="h-5 w-5" />
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-foreground">{labels.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{labels.description}</p>
                    <p className="mt-1 text-xs text-brand-600">
                        {definition.filteredByPeriod ? t.reports.card.periodBasis(labels.periodBasis) : t.reports.card.snapshot}
                    </p>
                </div>

                <div>
                    <p className="text-xl font-bold text-foreground">
                        {definition.isAmount && summary.total !== null
                            ? f.currency(summary.total)
                            : summary.count}
                    </p>
                    {definition.isAmount && (
                        <p className="text-xs text-muted-foreground">{t.common.items(summary.count)}</p>
                    )}
                </div>

                <Button
                    render={<a href={`/api/export/rapport?reportType=${summary.type}${periodQuery ? `&${periodQuery}` : ""}`} />}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    nativeButton={false}
                >
                    <Download className="h-4 w-4" />
                    {t.common.exportExcelLong}
                </Button>
            </CardContent>
        </Card>
    );
}

function PerformanceContent({ performance }: { performance: PerformanceSummaryDTO }) {
    const { t, f } = useI18n();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{t.reports.performance.totalBilled}</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {f.currency(performance.rentabiliteGlobale.totalFacture)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{t.reports.performance.totalCollected}</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {f.currency(performance.rentabiliteGlobale.totalEncaisse)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{t.reports.performance.collectionRate}</p>
                        <p className="mt-2 text-xl font-bold text-foreground">
                            {f.percent(performance.rentabiliteGlobale.tauxRecouvrement)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border border-border shadow-sm">
                <CardContent className="px-6 py-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        {t.reports.performance.occupancyByBuilding}{" "}
                        <span className="font-normal text-muted-foreground">{t.reports.performance.currentSituation}</span>
                    </p>

                    {performance.occupationParImmeuble.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t.reports.performance.noBuildings}</p>
                    ) : (
                        <div className="space-y-2">
                            {performance.occupationParImmeuble.map((immeuble) => (
                                <div
                                    key={immeuble.immeubleId}
                                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                                >
                                    <span className="text-foreground">{immeuble.immeubleNom}</span>
                                    <span className="text-muted-foreground">
                                        {t.reports.performance.occupiedUnits(immeuble.unitesOccupees, immeuble.totalUnites)}{" "}
                                        <span className="font-medium text-foreground">
                                            {f.percent(immeuble.tauxOccupation)}%
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
                        {t.reports.performance.yieldByBuilding} ({t.reports.performance.yieldBasis[performance.rendementBasis]})
                    </p>

                    {performance.rendementParImmeuble.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t.reports.performance.noBuildings}</p>
                    ) : (
                        <div className="space-y-2">
                            {performance.rendementParImmeuble.map((immeuble) => (
                                <div
                                    key={immeuble.immeubleId}
                                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                                >
                                    <span className="text-foreground">{immeuble.immeubleNom}</span>
                                    <span className="text-muted-foreground">
                                        {t.reports.performance.perYear(f.currency(immeuble.revenuAnnuelEncaisse))}{" "}
                                        <span className="font-medium text-foreground">
                                            {immeuble.rendement !== null
                                                ? `${f.percent(immeuble.rendement)}%`
                                                : t.reports.performance.noEstimatedValue}
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

export function RapportsPanel({ summaries, performance, periodQuery }: RapportsPanelProps) {
    const { t } = useI18n();

    return (
        <Tabs defaultValue="LOCATIFS">
            <TabsList>
                {REPORT_CATEGORIES.map((category) => (
                    <TabsTab key={category} value={category}>
                        {t.reports.categories[category]}
                    </TabsTab>
                ))}
            </TabsList>

            {REPORT_CATEGORIES.map((category) => (
                <TabsPanel key={category} value={category}>
                    {category === "PERFORMANCE" ? (
                        <PerformanceContent performance={performance} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {summaries
                                .filter((summary) => REPORT_DEFINITIONS.find((d) => d.type === summary.type)?.category === category)
                                .map((summary) => (
                                    <ReportCard key={summary.type} summary={summary} periodQuery={periodQuery} />
                                ))}
                        </div>
                    )}
                </TabsPanel>
            ))}
        </Tabs>
    );
}
