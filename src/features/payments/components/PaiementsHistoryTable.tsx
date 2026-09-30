import { History } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import { AnnulerPaiementButton } from "@/features/payments/components/AnnulerPaiementButton";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

type PaiementsHistoryTableProps = {
    paiements: readonly PaiementDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function PaiementsHistoryTable({ paiements }: PaiementsHistoryTableProps) {
    if (paiements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
                <History className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun paiement enregistré pour cette facture.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Enregistré par</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paiements.map((paiement) => (
                        <TableRow key={paiement.id}>
                            <TableCell className="text-muted-foreground">
                                {dateFormatter.format(paiement.datePaiement)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{MODE_PAIEMENT_LABELS[paiement.mode]}</TableCell>
                            <TableCell className="text-muted-foreground">{paiement.reference ?? "—"}</TableCell>
                            <TableCell className="font-medium text-foreground">
                                {currencyFormatter.format(paiement.montant)}
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
