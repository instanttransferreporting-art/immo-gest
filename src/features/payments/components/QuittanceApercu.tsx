"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrintLetterhead } from "@/components/layout/PrintLetterhead";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import type { PaiementDTO } from "@/features/payments/types/payment.types";
import { useI18n } from "@/i18n/client";

type QuittanceApercuProps = {
    facture: FactureDTO;
    paiements: readonly PaiementDTO[];
};

export function QuittanceApercu({ facture, paiements }: QuittanceApercuProps) {
    const { t, f } = useI18n();

    const totalPaye = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    const locataireNom =
        facture.contrat.locataire.raisonSociale ??
        `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`;

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="space-y-6 px-6 py-4">
                <PrintLetterhead />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{t.invoices.receipt.title}</h2>
                        <p className="text-sm text-muted-foreground">{t.invoices.receipt.invoiceRef(facture.numero)}</p>
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
                            render={<a href={`/api/export/quittance?factureId=${facture.id}`} />}
                            className="rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                            nativeButton={false}
                        >
                            <Download className="h-4 w-4" />
                            {t.common.downloadPdf}
                        </Button>
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">{t.invoices.tenant}</dt>
                        <dd className="font-medium text-foreground">{locataireNom}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">{t.invoices.receipt.unit}</dt>
                        <dd className="font-medium text-foreground">
                            {facture.contrat.unite.immeuble.nom} — {facture.contrat.unite.numero}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">{t.invoices.period}</dt>
                        <dd className="font-medium text-foreground">
                            {f.monthYear(facture.mois, facture.annee)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">{t.invoices.receipt.issueDate}</dt>
                        <dd className="font-medium text-foreground">{f.dateLong(facture.dateEmission)}</dd>
                    </div>
                </dl>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.invoices.receipt.rent}</span>
                        <span className="text-foreground">{f.currency(facture.montantLoyer)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.invoices.receipt.charges}</span>
                        <span className="text-foreground">{f.currency(facture.montantCharges)}</span>
                    </div>
                    {facture.penalites > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>{t.invoices.receipt.penalties}</span>
                            <span>{f.currency(facture.penalites)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold">
                        <span className="text-foreground">{t.invoices.receipt.totalDue}</span>
                        <span className="text-foreground">{f.currency(facture.totalDu)}</span>
                    </div>
                    <div className="flex justify-between text-brand-700">
                        <span>{t.invoices.receipt.totalCollected}</span>
                        <span>{f.currency(totalPaye)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span className="text-foreground">{t.invoices.receipt.balanceDue}</span>
                        <span className="text-foreground">{f.currency(facture.soldeRestant)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
