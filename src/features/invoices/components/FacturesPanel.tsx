"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacturesTable } from "@/features/invoices/components/FacturesTable";
import { GenererFacturesButton } from "@/features/invoices/components/GenererFacturesButton";
import { MOIS_LABELS, STATUT_FACTURE_LABELS } from "@/features/invoices/constants/invoice.constants";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";

type FacturesPanelProps = {
    factures: readonly FactureDTO[];
};

const ALL_VALUE = "TOUS";

export function FacturesPanel({ factures }: FacturesPanelProps) {
    const [statutFilter, setStatutFilter] = useState<string>(ALL_VALUE);
    const [moisFilter, setMoisFilter] = useState<string>(ALL_VALUE);

    const availableMois = useMemo(() => {
        const unique = new Set(factures.map((facture) => `${facture.annee}-${facture.mois}`));
        return Array.from(unique).sort().reverse();
    }, [factures]);

    const filteredFactures = useMemo(() => {
        return factures.filter((facture) => {
            const matchesStatut = statutFilter === ALL_VALUE || facture.statut === statutFilter;
            const matchesMois = moisFilter === ALL_VALUE || `${facture.annee}-${facture.mois}` === moisFilter;

            return matchesStatut && matchesMois;
        });
    }, [factures, statutFilter, moisFilter]);

    return (
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-slate-900">Factures</CardTitle>
                <GenererFacturesButton />
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={statutFilter}
                        onChange={(event) => setStatutFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les statuts</option>
                        {Object.entries(STATUT_FACTURE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={moisFilter}
                        onChange={(event) => setMoisFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les mois</option>
                        {availableMois.map((key) => {
                            const [annee, mois] = key.split("-").map(Number);
                            return (
                                <option key={key} value={key}>
                                    {MOIS_LABELS[mois - 1]} {annee}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <FacturesTable factures={filteredFactures} />
            </CardContent>
        </Card>
    );
}
