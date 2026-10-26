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
import type { PaiementListItemDTO } from "@/features/payments/types/payment.types";
import { useI18n } from "@/i18n/client";

type PaiementsTableProps = {
    paiements: readonly PaiementListItemDTO[];
};

export function PaiementsTable({ paiements }: PaiementsTableProps) {
    const { t, f } = useI18n();

    if (paiements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.payments.empty}</p>
                <p className="text-sm text-muted-foreground">{t.payments.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.common.date}</TableHead>
                        <TableHead>{t.invoices.number}</TableHead>
                        <TableHead>{t.invoices.tenant}</TableHead>
                        <TableHead>{t.invoices.receipt.unit}</TableHead>
                        <TableHead>{t.payments.mode}</TableHead>
                        <TableHead>{t.payments.reference}</TableHead>
                        <TableHead>{t.common.amount}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                        <TableHead>{t.payments.recordedBy}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paiements.map((paiement) => (
                        <TableRow key={paiement.id}>
                            <TableCell className="text-muted-foreground">
                                {f.date(paiement.datePaiement)}
                            </TableCell>
                            <TableCell>
                                <Link href={`${ROUTES.INVOICES}/${paiement.factureId}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-brand-700 hover:bg-brand-50"
                                    >
                                        {paiement.factureNumero}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{paiement.locataireNom}</TableCell>
                            <TableCell className="text-muted-foreground">{paiement.uniteLabel}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {t.enums.modePaiement[paiement.mode]}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{paiement.reference ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {f.currency(paiement.montant)}
                            </TableCell>
                            <TableCell>
                                {paiement.estAnnule ? (
                                    <Badge variant="destructive" className="rounded-lg">
                                        {t.payments.cancelled}
                                    </Badge>
                                ) : (
                                    <Badge className="rounded-lg bg-brand-50 text-brand-700">{t.payments.paid}</Badge>
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
