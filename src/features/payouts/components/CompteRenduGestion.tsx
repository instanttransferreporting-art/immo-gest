"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrintLetterhead } from "@/components/layout/PrintLetterhead";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";
import { useI18n } from "@/i18n/client";

type CompteRenduGestionProps = {
    reversement: ReversementDTO;
};

export function CompteRenduGestion({ reversement }: CompteRenduGestionProps) {
    const { t, f } = useI18n();

    const proprietaireNom = `${reversement.proprietaire.nom} ${reversement.proprietaire.prenom ?? ""}`.trim();

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="space-y-6 px-6 py-4">
                <PrintLetterhead />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{t.operations.payouts.reportTitle}</h2>
                        <p className="text-sm text-muted-foreground">
                            {f.monthYear(reversement.mois, reversement.annee)}
                        </p>
                    </div>

                    <div className="flex gap-2 print:hidden">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => window.print()}
                        >
                            <Printer className="h-4 w-4" />
                            {t.common.print}
                        </Button>

                        <Button
                            render={<a href={`/api/export/reversement?reversementId=${reversement.id}`} />}
                            className="rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                            nativeButton={false}
                        >
                            <Download className="h-4 w-4" />
                            {t.common.exportExcel}
                        </Button>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">{t.operations.payouts.owner}</dt>
                        <dd className="font-medium text-foreground">{proprietaireNom}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">{t.common.status}</dt>
                        <dd className="font-medium text-foreground">{t.enums.statutReversement[reversement.statut]}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">{t.operations.payouts.generatedOn}</dt>
                        <dd className="font-medium text-foreground">{f.dateLong(reversement.dateGeneration)}</dd>
                    </div>
                    {reversement.dateValidation && (
                        <div>
                            <dt className="text-muted-foreground">{t.operations.payouts.approvedOn}</dt>
                            <dd className="font-medium text-foreground">
                                {f.dateLong(reversement.dateValidation)}
                            </dd>
                        </div>
                    )}
                </dl>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.operations.payouts.totalCollected}</span>
                        <span className="text-foreground">{f.currency(reversement.totalEncaisse)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t.operations.payouts.agencyFees(reversement.tauxCommission)}
                        </span>
                        <span className="text-red-600">- {f.currency(reversement.commission)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                        <span className="text-foreground">{t.operations.payouts.netToOwner}</span>
                        <span className="text-brand-700">{f.currency(reversement.netAPayer)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
