import { History } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AnnulerPaiementButton } from "@/features/payments/components/AnnulerPaiementButton";
import type { PaiementDTO } from "@/features/payments/types/payment.types";
import { useI18n } from "@/i18n/client";

type PaiementsHistoryTableProps = {
    paiements: readonly PaiementDTO[];
};

export function PaiementsHistoryTable({ paiements }: PaiementsHistoryTableProps) {
    const { t, f } = useI18n();

    if (paiements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
                <History className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t.payments.emptyForInvoice}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.common.date}</TableHead>
                        <TableHead>{t.payments.mode}</TableHead>
                        <TableHead>{t.payments.reference}</TableHead>
                        <TableHead>{t.common.amount}</TableHead>
                        <TableHead>{t.payments.recordedBy}</TableHead>
                        <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paiements.map((paiement) => (
                        <TableRow key={paiement.id}>
                            <TableCell className="text-muted-foreground">
                                {f.date(paiement.datePaiement)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{t.enums.modePaiement[paiement.mode]}</TableCell>
                            <TableCell className="text-muted-foreground">{paiement.reference ?? "—"}</TableCell>
                            <TableCell className="font-medium text-foreground">
                                {f.currency(paiement.montant)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {paiement.enregistrePar.prenom} {paiement.enregistrePar.nom}
                            </TableCell>
                            <TableCell className="text-right">
                                <AnnulerPaiementButton paiement={paiement} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
