import Link from "next/link";
import { Receipt } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import type { PaiementListItemDTO } from "@/features/payments/types/payment.types";

type PaiementsTableProps = {
    paiements: readonly PaiementListItemDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function PaiementsTable({ paiements }: PaiementsTableProps) {
    if (paiements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucun paiement enregistré</p>
                <p className="text-sm text-muted-foreground">Les paiements enregistrés sur les factures apparaîtront ici.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Date</TableHead>
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Enregistré par</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paiements.map((paiement) => (
                        <TableRow key={paiement.id}>
                            <TableCell className="text-muted-foreground">
                                {dateFormatter.format(paiement.datePaiement)}
                            </TableCell>
                            <TableCell>
                                <Link href={`${ROUTES.INVOICES}/${paiement.factureId}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-emerald-700 hover:bg-emerald-50"
                                    >
                                        {paiement.factureNumero}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{paiement.locataireNom}</TableCell>
                            <TableCell className="text-muted-foreground">{paiement.uniteLabel}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {MODE_PAIEMENT_LABELS[paiement.mode]}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{paiement.reference ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {currencyFormatter.format(paiement.montant)}
                            </TableCell>
                            <TableCell>
                                {paiement.estAnnule ? (
                                    <Badge variant="destructive" className="rounded-lg">
                                        Annulé
                                    </Badge>
                                ) : (
                                    <Badge className="rounded-lg bg-emerald-50 text-emerald-700">Payé</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{paiement.enregistreParNom}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
