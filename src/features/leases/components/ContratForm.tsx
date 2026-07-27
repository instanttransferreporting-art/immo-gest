"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createContrat } from "@/features/leases/actions/contrat.actions";
import { contratSchema, type ContratFormValues } from "@/features/leases/schemas/lease.schema";
import { FREQUENCE_LABELS } from "@/features/leases/constants/lease.constants";
import { calculateProrata } from "@/features/leases/services/prorata.calculator";
import { FrequenceEcheance } from "@/generated/prisma/enums";
import type { ContratDTO, LocataireOptionDTO, UniteLibreOptionDTO } from "@/features/leases/types/lease.types";

type ContratFormProps = {
    uniteOptions: readonly UniteLibreOptionDTO[];
    locataireOptions: readonly LocataireOptionDTO[];
    onSuccess?: (contrat: ContratDTO) => void;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export function ContratForm({ uniteOptions, locataireOptions, onSuccess }: ContratFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContratFormValues>({
        resolver: zodResolver(contratSchema),
        defaultValues: {
            frequence: FrequenceEcheance.MENSUEL,
        },
    });

    const uniteId = watch("uniteId");
    const dateDebut = watch("dateDebut");
    const loyerBase = watch("loyerBase");

    useEffect(() => {
        const selectedUnite = uniteOptions.find((option) => option.id === uniteId);

        if (selectedUnite) {
            setValue("loyerBase", selectedUnite.loyerMensuel);
            setValue("charges", 0);
            setValue("depotGarantie", selectedUnite.caution);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniteId]);

    const prorata =
        dateDebut instanceof Date && !Number.isNaN(dateDebut.getTime()) && loyerBase
            ? calculateProrata(dateDebut, loyerBase)
            : null;

    async function onSubmit(values: ContratFormValues) {
        const result = await createContrat(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        reset({ frequence: FrequenceEcheance.MENSUEL });
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="uniteId" className="text-sm font-medium text-slate-900">
                    Unité (libre)
                </label>
                <select
                    id="uniteId"
                    className={cn(
                        "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.uniteId && "border-red-500"
                    )}
                    {...register("uniteId")}
                >
                    <option value="">Sélectionner une unité</option>
                    {uniteOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.immeuble.nom} — {option.numero}
                        </option>
                    ))}
                </select>
                {errors.uniteId && <p className="animate-pulse text-sm text-red-500">{errors.uniteId.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="locataireId" className="text-sm font-medium text-slate-900">
                    Locataire
                </label>
                <select
                    id="locataireId"
                    className={cn(
                        "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.locataireId && "border-red-500"
                    )}
                    {...register("locataireId")}
                >
                    <option value="">Sélectionner un locataire</option>
                    {locataireOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.raisonSociale ?? `${option.nom} ${option.prenom}`}
                        </option>
                    ))}
                </select>
                {errors.locataireId && (
                    <p className="animate-pulse text-sm text-red-500">{errors.locataireId.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="dateDebut" className="text-sm font-medium text-slate-900">
                        Date de début
                    </label>
                    <Input
                        id="dateDebut"
                        type="date"
                        defaultValue={toDateInputValue(new Date())}
                        className={cn("h-10 rounded-xl", errors.dateDebut && "border-red-500")}
                        {...register("dateDebut", { setValueAs: (value) => (value ? new Date(value) : new Date("")) })}
                    />
                    {errors.dateDebut && (
                        <p className="animate-pulse text-sm text-red-500">{errors.dateDebut.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="dateFin" className="text-sm font-medium text-slate-900">
                        Date de fin
                    </label>
                    <Input
                        id="dateFin"
                        type="date"
                        className={cn("h-10 rounded-xl", errors.dateFin && "border-red-500")}
                        {...register("dateFin", { setValueAs: (value) => (value ? new Date(value) : new Date("")) })}
                    />
                    {errors.dateFin && <p className="animate-pulse text-sm text-red-500">{errors.dateFin.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <label htmlFor="loyerBase" className="text-sm font-medium text-slate-900">
                        Loyer de base
                    </label>
                    <Input
                        id="loyerBase"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.loyerBase && "border-red-500")}
                        {...register("loyerBase", { valueAsNumber: true })}
                    />
                    {errors.loyerBase && (
                        <p className="animate-pulse text-sm text-red-500">{errors.loyerBase.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="charges" className="text-sm font-medium text-slate-900">
                        Charges
                    </label>
                    <Input
                        id="charges"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.charges && "border-red-500")}
                        {...register("charges", { valueAsNumber: true })}
                    />
                    {errors.charges && <p className="animate-pulse text-sm text-red-500">{errors.charges.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="depotGarantie" className="text-sm font-medium text-slate-900">
                        Caution
                    </label>
                    <Input
                        id="depotGarantie"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.depotGarantie && "border-red-500")}
                        {...register("depotGarantie", { valueAsNumber: true })}
                    />
                    {errors.depotGarantie && (
                        <p className="animate-pulse text-sm text-red-500">{errors.depotGarantie.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="frequence" className="text-sm font-medium text-slate-900">
                    Fréquence de paiement
                </label>
                <select
                    id="frequence"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("frequence")}
                >
                    {Object.entries(FREQUENCE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {prorata !== null && (
                <div className="rounded-xl bg-emerald-50 p-4 text-sm">
                    <p className="font-medium text-emerald-800">Aperçu du premier loyer (prorata temporis)</p>
                    <p className="mt-1 text-emerald-700">
                        {currencyFormatter.format(prorata)}
                        {prorata !== loyerBase && (
                            <span className="text-emerald-600"> (au lieu de {currencyFormatter.format(loyerBase)})</span>
                        )}
                    </p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le contrat"}
            </Button>
        </form>
    );
}
