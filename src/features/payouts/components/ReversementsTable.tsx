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
import type { ReversementDTO, StatutReversement } from "@/features/payouts/types/payout.types";
import { useI18n } from "@/i18n/client";

type ReversementsTableProps = {
    reversements: readonly ReversementDTO[];
};

const STATUT_BADGE_VARIANT: Record<StatutReversement, "default" | "outline"> = {
    BROUILLON: "outline",
    VALIDE: "default",
};

export function ReversementsTable({ reversements }: ReversementsTableProps) {
    const { t, f } = useI18n();

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
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <FileBarChart className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.operations.payouts.empty}</p>
                <p className="text-sm text-muted-foreground">{t.operations.payouts.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.operations.payouts.period}</TableHead>
                        <TableHead>{t.operations.payouts.totalCollected}</TableHead>
                        <TableHead>{t.operations.payouts.commissionColumn}</TableHead>
                        <TableHead>{t.operations.payouts.netToPay}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {reversements.map((reversement) => (
                        <TableRow key={reversement.id}>
                            <TableCell className="text-muted-foreground">
                                {f.monthYear(reversement.mois, reversement.annee)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {f.currency(reversement.totalEncaisse)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {f.currency(reversement.commission)} ({reversement.tauxCommission}%)
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {f.currency(reversement.netAPayer)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[reversement.statut]} className="rounded-lg">
                                    {t.enums.statutReversement[reversement.statut]}
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
                                        {t.operations.payouts.approve}
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
