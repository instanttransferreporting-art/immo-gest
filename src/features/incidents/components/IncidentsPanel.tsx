"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { IncidentsBoard } from "@/features/incidents/components/IncidentsBoard";
import { STATUT_INCIDENT_LABELS, STATUT_INCIDENT_ORDER } from "@/features/incidents/constants/incident.constants";
import type { IncidentDTO, UniteOptionDTO } from "@/features/incidents/types/incident.types";
import type { ImmeubleOptionDTO } from "@/features/properties/types/property.types";

type IncidentsPanelProps = {
    incidents: readonly IncidentDTO[];
    uniteOptions: readonly UniteOptionDTO[];
    immeubleOptions: readonly ImmeubleOptionDTO[];
};

const ALL_VALUE = "TOUS";
const ACTION_REQUISE_VALUE = "ACTION_REQUISE";

export function IncidentsPanel({ incidents, uniteOptions, immeubleOptions }: IncidentsPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [immeubleFilter, setImmeubleFilter] = useState<string>(ALL_VALUE);
    const [statutFilter, setStatutFilter] = useState<string>(ALL_VALUE);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    const filteredIncidents = useMemo(() => {
        return incidents.filter((incident) => {
            const effectiveImmeubleId = incident.immeuble?.id ?? incident.unite?.immeubleId ?? null;
            const matchesImmeuble = immeubleFilter === ALL_VALUE || effectiveImmeubleId === immeubleFilter;

            const matchesStatut =
                statutFilter === ALL_VALUE ||
                (statutFilter === ACTION_REQUISE_VALUE
                    ? incident.statut === "NOUVEAU" || incident.statut === "EN_COURS"
                    : incident.statut === statutFilter);

            return matchesImmeuble && matchesStatut;
        });
    }, [incidents, immeubleFilter, statutFilter]);

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Incidents</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        Signaler
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Nouvel incident</DialogTitle>
                        </DialogHeader>

                        <IncidentForm
                            uniteOptions={uniteOptions}
                            immeubleOptions={immeubleOptions}
                            onSuccess={handleSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={immeubleFilter}
                        onChange={(event) => setImmeubleFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les immeubles</option>
                        {immeubleOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.nom}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statutFilter}
                        onChange={(event) => setStatutFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les statuts</option>
                        <option value={ACTION_REQUISE_VALUE}>Nécessite une action</option>
                        {STATUT_INCIDENT_ORDER.map((statut) => (
                            <option key={statut} value={statut}>
                                {STATUT_INCIDENT_LABELS[statut]}
                            </option>
                        ))}
                    </select>
                </div>

                <IncidentsBoard incidents={filteredIncidents} />
            </CardContent>
        </Card>
    );
}
