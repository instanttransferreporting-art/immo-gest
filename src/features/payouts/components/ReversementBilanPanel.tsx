"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { genererReversement } from "@/features/payouts/actions/reversement.actions";
import { ReversementsTable } from "@/features/payouts/components/ReversementsTable";
import { CompteRenduGestion } from "@/features/payouts/components/CompteRenduGestion";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";

type ReversementBilanPanelProps = {
    proprietaireId: string;
    reversements: readonly ReversementDTO[];
};

const now = new Date();

export function ReversementBilanPanel({ proprietaireId, reversements }: ReversementBilanPanelProps) {
    const router = useRouter();
    const [mois, setMois] = useState(now.getMonth() + 1);
    const [annee, setAnnee] = useState(now.getFullYear());
    const [isPending, setIsPending] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(reversements[0]?.id ?? null);

    const selected = useMemo(
        () => reversements.find((reversement) => reversement.id === selectedId) ?? reversements[0] ?? null,
        [reversements, selectedId]
    );

    async function handleGenerer() {
        setIsPending(true);
        const result = await genererReversement({ proprietaireId, mois, annee });
        toast.add({ title: result.message, type: result.success ? "success" : "error" });
        setIsPending(false);

        if (result.success && result.data) {
            setSelectedId(result.data.id);
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">Reversements</CardTitle>

                    <div className="flex items-center gap-2">
                        <select
                            value={mois}
                            onChange={(event) => setMois(Number(event.target.value))}
                            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {MOIS_LABELS.map((label, index) => (
                                <option key={label} value={index + 1}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={annee}
                            onChange={(event) => setAnnee(Number(event.target.value))}
                            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {[annee - 1, annee, annee + 1].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        <Button
                            type="button"
                            onClick={handleGenerer}
                            disabled={isPending}
                            className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ReceiptText className="h-4 w-4" />
                            )}
                            Générer le bilan
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="px-6">
                    <ReversementsTable reversements={reversements} />
                </CardContent>
            </Card>

            {selected && <CompteRenduGestion reversement={selected} />}
        </div>
    );
}
