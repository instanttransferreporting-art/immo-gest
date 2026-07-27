"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createIncident } from "@/features/incidents/actions/incident.actions";
import { incidentSchema, type IncidentFormValues } from "@/features/incidents/schemas/incident.schema";
import { PRIORITE_INCIDENT_LABELS } from "@/features/incidents/constants/incident.constants";
import { PrioriteIncident } from "@/generated/prisma/enums";
import type { IncidentDTO, UniteOptionDTO } from "@/features/incidents/types/incident.types";
import type { ImmeubleOptionDTO } from "@/features/properties/types/property.types";

type IncidentFormProps = {
    uniteOptions: readonly UniteOptionDTO[];
    immeubleOptions: readonly ImmeubleOptionDTO[];
    onSuccess?: (incident: IncidentDTO) => void;
};

const DEFAULT_VALUES: IncidentFormValues = {
    titre: "",
    description: "",
    priorite: PrioriteIncident.MOYENNE,
    uniteId: "",
    immeubleId: "",
    prestataire: "",
};

export function IncidentForm({ uniteOptions, immeubleOptions, onSuccess }: IncidentFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<IncidentFormValues>({
        resolver: zodResolver(incidentSchema),
        defaultValues: DEFAULT_VALUES,
    });

    async function onSubmit(values: IncidentFormValues) {
        const result = await createIncident(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        reset(DEFAULT_VALUES);
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="titre" className="text-sm font-medium text-slate-900">
                    Titre
                </label>
                <Input
                    id="titre"
                    placeholder="Fuite d'eau salle de bain"
                    className={cn("h-10 rounded-xl", errors.titre && "border-red-500")}
                    {...register("titre")}
                />
                {errors.titre && <p className="animate-pulse text-sm text-red-500">{errors.titre.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-medium text-slate-900">
                    Description
                </label>
                <textarea
                    id="description"
                    rows={3}
                    className={cn(
                        "w-full rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.description && "border-red-500"
                    )}
                    {...register("description")}
                />
                {errors.description && (
                    <p className="animate-pulse text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="priorite" className="text-sm font-medium text-slate-900">
                    Priorité
                </label>
                <select
                    id="priorite"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("priorite")}
                >
                    {Object.entries(PRIORITE_INCIDENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="uniteId" className="text-sm font-medium text-slate-900">
                        Unité concernée (optionnel)
                    </label>
                    <select
                        id="uniteId"
                        className={cn(
                            "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            errors.uniteId && "border-red-500"
                        )}
                        {...register("uniteId")}
                    >
                        <option value="">Aucune</option>
                        {uniteOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.immeuble.nom} — {option.numero}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="immeubleId" className="text-sm font-medium text-slate-900">
                        Immeuble concerné (optionnel)
                    </label>
                    <select
                        id="immeubleId"
                        className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...register("immeubleId")}
                    >
                        <option value="">Aucun</option>
                        {immeubleOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.nom}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {errors.uniteId && <p className="animate-pulse text-sm text-red-500">{errors.uniteId.message}</p>}

            <div className="space-y-1.5">
                <label htmlFor="prestataire" className="text-sm font-medium text-slate-900">
                    Prestataire assigné (optionnel)
                </label>
                <Input id="prestataire" className="h-10 rounded-xl" {...register("prestataire")} />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Signaler l'incident"}
            </Button>
        </form>
    );
}
