"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import { STATUT_REVERSEMENT_LABELS } from "@/features/payouts/constants/payout.constants";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";

type CompteRenduGestionProps = {
    reversement: ReversementDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export function CompteRenduGestion({ reversement }: CompteRenduGestionProps) {
    const proprietaireNom = `${reversement.proprietaire.nom} ${reversement.proprietaire.prenom ?? ""}`.trim();

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="space-y-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Compte Rendu de Gestion</h2>
                        <p className="text-sm text-muted-foreground">
                            {MOIS_LABELS[reversement.mois - 1]} {reversement.annee}
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
                            Imprimer
                        </Button>

                        <Button
                            render={<a href={`/api/export/reversement?reversementId=${reversement.id}`} />}
                            className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            nativeButton={false}
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Propriétaire</dt>
                        <dd className="font-medium text-foreground">{proprietaireNom}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Statut</dt>
                        <dd className="font-medium text-foreground">{STATUT_REVERSEMENT_LABELS[reversement.statut]}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Date de génération</dt>
                        <dd className="font-medium text-foreground">{dateFormatter.format(reversement.dateGeneration)}</dd>
                    </div>
                    {reversement.dateValidation && (
                        <div>
                            <dt className="text-muted-foreground">Date de validation</dt>
                            <dd className="font-medium text-foreground">
                                {dateFormatter.format(reversement.dateValidation)}
                            </dd>
                        </div>
                    )}
                </dl>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total encaissé</span>
                        <span className="text-foreground">{currencyFormatter.format(reversement.totalEncaisse)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Frais d&apos;agence ({reversement.tauxCommission}%)
                        </span>
                        <span className="text-red-600">- {currencyFormatter.format(reversement.commission)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                        <span className="text-foreground">Net à payer au propriétaire</span>
                        <span className="text-emerald-700">{currencyFormatter.format(reversement.netAPayer)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
