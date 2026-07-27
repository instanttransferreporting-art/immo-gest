"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

type QuittanceApercuProps = {
    facture: FactureDTO;
    paiements: readonly PaiementDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export function QuittanceApercu({ facture, paiements }: QuittanceApercuProps) {
    const totalPaye = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    const locataireNom =
        facture.contrat.locataire.raisonSociale ??
        `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`;

    return (
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardContent className="space-y-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Quittance de Loyer</h2>
                        <p className="text-sm text-slate-500">Facture {facture.numero}</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg print:hidden"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                        Imprimer
                    </Button>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-slate-500">Locataire</dt>
                        <dd className="font-medium text-slate-900">{locataireNom}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Unité</dt>
                        <dd className="font-medium text-slate-900">
                            {facture.contrat.unite.immeuble.nom} — {facture.contrat.unite.numero}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Période</dt>
                        <dd className="font-medium text-slate-900">
                            {MOIS_LABELS[facture.mois - 1]} {facture.annee}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Date d&apos;émission</dt>
                        <dd className="font-medium text-slate-900">{dateFormatter.format(facture.dateEmission)}</dd>
                    </div>
                </dl>

                <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Loyer</span>
                        <span className="text-slate-900">{currencyFormatter.format(facture.montantLoyer)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Charges</span>
                        <span className="text-slate-900">{currencyFormatter.format(facture.montantCharges)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span className="text-slate-900">Total dû</span>
                        <span className="text-slate-900">{currencyFormatter.format(facture.totalDu)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                        <span>Total encaissé</span>
                        <span>{currencyFormatter.format(totalPaye)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span className="text-slate-900">Reste à payer</span>
                        <span className="text-slate-900">{currencyFormatter.format(facture.soldeRestant)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
