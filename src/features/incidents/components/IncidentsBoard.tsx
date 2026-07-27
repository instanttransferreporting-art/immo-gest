"use client";

import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { updateStatutIncident } from "@/features/incidents/actions/incident.actions";
import {
    PRIORITE_INCIDENT_LABELS,
    PRIORITE_INCIDENT_STYLES,
    STATUT_INCIDENT_LABELS,
    STATUT_INCIDENT_ORDER,
    STATUT_INCIDENT_STYLES,
} from "@/features/incidents/constants/incident.constants";
import { StatutIncident } from "@/generated/prisma/enums";
import type { IncidentDTO } from "@/features/incidents/types/incident.types";

type IncidentsBoardProps = {
    incidents: readonly IncidentDTO[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function IncidentsBoard({ incidents }: IncidentsBoardProps) {
    const router = useRouter();

    async function handleStatutChange(incidentId: string, statut: StatutIncident) {
        const result = await updateStatutIncident({ incidentId, statut });
        toast.add({ title: result.message, type: result.success ? "success" : "error" });

        if (result.success) {
            router.refresh();
        }
    }

    if (incidents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Wrench className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucun incident</p>
                <p className="text-sm text-slate-400">Signalez une panne pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {STATUT_INCIDENT_ORDER.map((statut) => {
                const columnIncidents = incidents.filter((incident) => incident.statut === statut);

                return (
                    <div key={statut} className="space-y-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between px-1">
                            <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${STATUT_INCIDENT_STYLES[statut]}`}>
                                {STATUT_INCIDENT_LABELS[statut]}
                            </span>
                            <span className="text-xs text-slate-400">{columnIncidents.length}</span>
                        </div>

                        <div className="space-y-3">
                            {columnIncidents.map((incident) => {
                                const lieu = incident.unite
                                    ? `${incident.unite.immeuble.nom} — ${incident.unite.numero}`
                                    : incident.immeuble?.nom;

                                return (
                                    <div
                                        key={incident.id}
                                        className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-slate-900">{incident.titre}</p>
                                            <Badge
                                                className={`rounded-lg ${PRIORITE_INCIDENT_STYLES[incident.priorite]}`}
                                            >
                                                {PRIORITE_INCIDENT_LABELS[incident.priorite]}
                                            </Badge>
                                        </div>

                                        <p className="line-clamp-2 text-xs text-slate-500">{incident.description}</p>

                                        {lieu && <p className="text-xs text-slate-400">{lieu}</p>}

                                        {incident.prestataire && (
                                            <p className="text-xs text-slate-400">
                                                Prestataire : {incident.prestataire}
                                            </p>
                                        )}

                                        <p className="text-xs text-slate-400">
                                            Signalé le {dateFormatter.format(incident.dateSignalement)}
                                        </p>

                                        <select
                                            value={incident.statut}
                                            onChange={(event) =>
                                                handleStatutChange(incident.id, event.target.value as StatutIncident)
                                            }
                                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                        >
                                            {STATUT_INCIDENT_ORDER.map((option) => (
                                                <option key={option} value={option}>
                                                    {STATUT_INCIDENT_LABELS[option]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
