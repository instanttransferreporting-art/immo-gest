"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileBarChart, Loader2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { validerReversement } from "@/features/payouts/actions/reversement.actions";
import { STATUT_REVERSEMENT_LABELS } from "@/features/payouts/constants/payout.constants";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import type { ReversementDTO, StatutReversement } from "@/features/payouts/types/payout.types";

type ReversementsTableProps = {
    reversements: readonly ReversementDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const STATUT_BADGE_VARIANT: Record<StatutReversement, "default" | "outline"> = {
    BROUILLON: "outline",
    VALIDE: "default",
};

export function ReversementsTable({ reversements }: ReversementsTableProps) {
    const router = useRouter();
    const [pendingId, setPendingId] = useState<string | null>(null);

    async function handleValider(reversementId: string) {
        setPendingId(reversementId);
        const result = await validerReversement({ reversementId });
        toast.add({ title: result.message, type: result.success ? "success" : "error" });
        setPendingId(null);

        if (result.success) {
            router.refresh();
        }
    }

    if (reversements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <FileBarChart className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucun reversement généré</p>
                <p className="text-sm text-slate-400">Générez le bilan du mois pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Période</TableHead>
                        <TableHead>Total encaissé</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Net à payer</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {reversements.map((reversement) => (
                        <TableRow key={reversement.id}>
                            <TableCell className="text-slate-600">
                                {MOIS_LABELS[reversement.mois - 1]} {reversement.annee}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {currencyFormatter.format(reversement.totalEncaisse)}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {currencyFormatter.format(reversement.commission)} ({reversement.tauxCommission}%)
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                                {currencyFormatter.format(reversement.netAPayer)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[reversement.statut]} className="rounded-lg">
                                    {STATUT_REVERSEMENT_LABELS[reversement.statut]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {reversement.statut === "BROUILLON" && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={pendingId === reversement.id}
                                        onClick={() => handleValider(reversement.id)}
                                        className="rounded-lg"
                                    >
                                        {pendingId === reversement.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                        )}
                                        Valider
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
