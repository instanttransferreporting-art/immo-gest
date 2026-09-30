"use client";

import { Download, Printer } from "lucide-react";

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
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="space-y-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Quittance de Loyer</h2>
                        <p className="text-sm text-muted-foreground">Facture {facture.numero}</p>
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
                            render={<a href={`/api/export/quittance?factureId=${facture.id}`} />}
                            className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            nativeButton={false}
                        >
                            <Download className="h-4 w-4" />
                            Télécharger PDF
                        </Button>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Locataire</dt>
                        <dd className="font-medium text-foreground">{locataireNom}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Unité</dt>
                        <dd className="font-medium text-foreground">
                            {facture.contrat.unite.immeuble.nom} — {facture.contrat.unite.numero}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Période</dt>
                        <dd className="font-medium text-foreground">
                            {MOIS_LABELS[facture.mois - 1]} {facture.annee}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Date d&apos;émission</dt>
                        <dd className="font-medium text-foreground">{dateFormatter.format(facture.dateEmission)}</dd>
                    </div>
                </dl>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Loyer</span>
                        <span className="text-foreground">{currencyFormatter.format(facture.montantLoyer)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Charges</span>
                        <span className="text-foreground">{currencyFormatter.format(facture.montantCharges)}</span>
                    </div>
                    {facture.penalites > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Pénalités de retard</span>
                            <span>{currencyFormatter.format(facture.penalites)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total dû</span>
                        <span className="text-foreground">{currencyFormatter.format(facture.totalDu)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                        <span>Total encaissé</span>
                        <span>{currencyFormatter.format(totalPaye)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Reste à payer</span>
                        <span className="text-foreground">{currencyFormatter.format(facture.soldeRestant)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
