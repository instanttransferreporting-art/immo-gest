"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaiementsTable } from "@/features/payments/components/PaiementsTable";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import type { PaiementListItemDTO } from "@/features/payments/types/payment.types";

type PaiementsPanelProps = {
    paiements: readonly PaiementListItemDTO[];
};

const ALL_VALUE = "TOUS";
const STATUT_PAYE = "PAYE";
const STATUT_ANNULE = "ANNULE";

export function PaiementsPanel({ paiements }: PaiementsPanelProps) {
    const [modeFilter, setModeFilter] = useState<string>(ALL_VALUE);
    const [statutFilter, setStatutFilter] = useState<string>(ALL_VALUE);

    const filteredPaiements = useMemo(() => {
        return paiements.filter((paiement) => {
            const matchesMode = modeFilter === ALL_VALUE || paiement.mode === modeFilter;
            const matchesStatut =
                statutFilter === ALL_VALUE ||
                (statutFilter === STATUT_ANNULE ? paiement.estAnnule : !paiement.estAnnule);

            return matchesMode && matchesStatut;
        });
    }, [paiements, modeFilter, statutFilter]);

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Paiements</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={statutFilter}
                        onChange={(event) => setStatutFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les statuts</option>
                        <option value={STATUT_PAYE}>Payé</option>
                        <option value={STATUT_ANNULE}>Annulé</option>
                    </select>

                    <select
                        value={modeFilter}
                        onChange={(event) => setModeFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les modes</option>
                        {Object.entries(MODE_PAIEMENT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <PaiementsTable paiements={filteredPaiements} />
            </CardContent>
        </Card>
    );
}
