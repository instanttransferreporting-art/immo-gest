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
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center">
                <History className="h-6 w-6 text-slate-300" />
                <p className="text-sm text-slate-400">Aucun paiement enregistré pour cette facture.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Enregistré par</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paiements.map((paiement) => (
                        <TableRow key={paiement.id}>
                            <TableCell className="text-slate-600">
                                {dateFormatter.format(paiement.datePaiement)}
                            </TableCell>
                            <TableCell className="text-slate-600">{MODE_PAIEMENT_LABELS[paiement.mode]}</TableCell>
                            <TableCell className="text-slate-600">{paiement.reference ?? "—"}</TableCell>
                            <TableCell className="font-medium text-slate-900">
                                {currencyFormatter.format(paiement.montant)}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {paiement.enregistrePar.prenom} {paiement.enregistrePar.nom}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
