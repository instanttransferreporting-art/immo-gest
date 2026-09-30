"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
    calculateDateFinAuto,
    calculateMontantContrat,
    getFrequenceDescription,
} from "@/features/leases/services/contrat-calculator";
import { FrequenceEcheance } from "@/generated/prisma/enums";
import type { ContratDTO, LocataireOptionDTO, UniteLibreOptionDTO } from "@/features/leases/types/lease.types";

type ContratFormProps = {
    uniteOptions: readonly UniteLibreOptionDTO[];
    locataireOptions: readonly LocataireOptionDTO[];
    onSuccess?: (contrat: ContratDTO) => void;
};

// N'utilise pas toISOString() : ça convertit en UTC et peut décaler la date
// d'un jour selon le fuseau horaire local (ex: minuit WAT -> 23h UTC la veille).
const toDateInputValue = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
        control,
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
    const frequence = watch("frequence");
    const nombreNuitees = watch("nombreNuitees");
    const montantTotalOverride = watch("montantTotalOverride");

    const isNuitee = frequence === FrequenceEcheance.QUOTIDIEN;

    // Calcul automatique du montant pour les nuitées
    const montantNuiteesCalc =
        isNuitee && loyerBase && nombreNuitees
            ? calculateMontantContrat({ frequence, loyerBase, nombreNuitees })
            : null;

    // Montant effectif : override manuel > calculé automatiquement
    const montantEffectif = isNuitee
        ? (montantTotalOverride ?? montantNuiteesCalc)
        : null;

    // Prorata uniquement pour les baux mensuels (non nuitées)
    const prorata =
        !isNuitee &&
        dateDebut instanceof Date &&
        !Number.isNaN(dateDebut.getTime()) &&
        loyerBase
            ? calculateProrata(dateDebut, loyerBase)
            : null;

    useEffect(() => {
        const selectedUnite = uniteOptions.find((option) => option.id === uniteId);

        if (selectedUnite) {
            setValue("loyerBase", selectedUnite.loyerMensuel);
            setValue("charges", 0);
            setValue("depotGarantie", selectedUnite.caution);

            // Pré-sélectionner la fréquence selon l'unité si meublée
            if (selectedUnite.isMeuble && selectedUnite.frequencePaiement === "NUITEE") {
                setValue("frequence", FrequenceEcheance.QUOTIDIEN);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniteId]);

    // Pour les baux classiques (hors nuitée), la date de fin est fixée
    // automatiquement au 31 décembre de l'année de début (règle fiscale).
    useEffect(() => {
        if (!isNuitee && dateDebut instanceof Date && !Number.isNaN(dateDebut.getTime())) {
            setValue("dateFin", calculateDateFinAuto(dateDebut));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateDebut, isNuitee]);

    async function onSubmit(values: ContratFormValues) {
        // Pour les baux à la nuitée, on utilise le montant override ou le montant calculé comme loyerBase
        const finalValues = { ...values };
        if (isNuitee && montantNuiteesCalc !== null && !values.montantTotalOverride) {
            // Pas de modification : loyerBase reste le tarif par nuit, nombreNuitees est stocké
        }
        if (isNuitee && values.montantTotalOverride) {
            // Si override : on remplace loyerBase par le montant total / nombreNuitees pour garder la cohérence
            // (le montantTotalOverride est simplement stocké comme loyerBase ajusté)
            finalValues.loyerBase = values.montantTotalOverride;
        }

        const result = await createContrat(finalValues);

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
            {/* Unité */}
            <div className="space-y-1.5">
                <label htmlFor="uniteId" className="text-sm font-medium text-foreground">
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
                            {option.isMeuble ? " (Meublé)" : ""}
                        </option>
                    ))}
                </select>
                {errors.uniteId && <p className="animate-pulse text-sm text-red-500">{errors.uniteId.message}</p>}
            </div>

            {/* Locataire */}
            <div className="space-y-1.5">
                <label htmlFor="locataireId" className="text-sm font-medium text-foreground">
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

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="dateDebut" className="text-sm font-medium text-foreground">
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
                    <label htmlFor="dateFin" className="text-sm font-medium text-foreground">
                        Date de fin
                    </label>
                    <Controller
                        control={control}
                        name="dateFin"
                        render={({ field }) => (
                            <Input
                                id="dateFin"
                                type="date"
                                disabled={!isNuitee}
                                className={cn("h-10 rounded-xl", !isNuitee && "bg-muted text-muted-foreground", errors.dateFin && "border-red-500")}
                                value={
                                    field.value instanceof Date && !Number.isNaN(field.value.getTime())
                                        ? toDateInputValue(field.value)
                                        : ""
                                }
                                onChange={(event) =>
                                    field.onChange(event.target.value ? new Date(event.target.value) : new Date(""))
                                }
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                    {!isNuitee ? (
                        <p className="text-xs text-muted-foreground">
                            Fixée automatiquement au 31 décembre de l&apos;année de début (période fiscale).
                        </p>
                    ) : (
                        errors.dateFin && <p className="animate-pulse text-sm text-red-500">{errors.dateFin.message}</p>
                    )}
                </div>
            </div>

            {/* Loyer, charges, caution */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <label htmlFor="loyerBase" className="text-sm font-medium text-foreground">
                        {isNuitee ? "Tarif par nuit" : "Loyer de base"}
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
                    <label htmlFor="charges" className="text-sm font-medium text-foreground">
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
                    <label htmlFor="depotGarantie" className="text-sm font-medium text-foreground">
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

            {/* Fréquence */}
            <div className="space-y-1.5">
                <label htmlFor="frequence" className="text-sm font-medium text-foreground">
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
                {frequence && (
                    <p className="text-xs text-muted-foreground">{getFrequenceDescription(frequence as FrequenceEcheance)}</p>
                )}
            </div>

            {/* Section nuitées — visible uniquement si QUOTIDIEN */}
            {isNuitee && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-4">
                    <p className="text-sm font-medium text-amber-800">
                        Mode nuitée — Tarification à la nuit
                    </p>

                    <div className="space-y-1.5">
                        <label htmlFor="nombreNuitees" className="text-sm font-medium text-foreground">
                            Nombre de nuitées
                        </label>
                        <Input
                            id="nombreNuitees"
                            type="number"
                            min={1}
                            className={cn("h-10 rounded-xl bg-background", errors.nombreNuitees && "border-red-500")}
                            {...register("nombreNuitees", { valueAsNumber: true })}
                        />
                        {errors.nombreNuitees && (
                            <p className="animate-pulse text-sm text-red-500">{errors.nombreNuitees.message}</p>
                        )}
                    </div>

                    {/* Affichage du montant calculé */}
                    {montantNuiteesCalc !== null && (
                        <div className="rounded-lg bg-card border border-amber-200 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Montant calculé</span>
                                <span className="font-semibold text-amber-800">
                                    {currencyFormatter.format(montantNuiteesCalc)}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {nombreNuitees} nuit{nombreNuitees !== 1 ? "s" : ""} × {currencyFormatter.format(loyerBase)}
                            </p>
                        </div>
                    )}

                    {/* Override montant */}
                    <div className="space-y-1.5">
                        <label htmlFor="montantTotalOverride" className="text-sm font-medium text-foreground">
                            Montant total (override manuel)
                            <span className="ml-1 text-xs font-normal text-muted-foreground">— optionnel</span>
                        </label>
                        <Input
                            id="montantTotalOverride"
                            type="number"
                            min={0}
                            placeholder={
                                montantNuiteesCalc !== null
                                    ? `Calculé : ${currencyFormatter.format(montantNuiteesCalc)}`
                                    : "Saisir un montant personnalisé"
                            }
                            className={cn(
                                "h-10 rounded-xl bg-background",
                                errors.montantTotalOverride && "border-red-500"
                            )}
                            {...register("montantTotalOverride", {
                                setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                            })}
                        />
                        {errors.montantTotalOverride && (
                            <p className="animate-pulse text-sm text-red-500">
                                {errors.montantTotalOverride.message}
                            </p>
                        )}
                        {montantTotalOverride && montantNuiteesCalc !== null && (
                            <p className="text-xs text-amber-600">
                                ⚠ Montant manuel : {currencyFormatter.format(montantTotalOverride)} (calculé : {currencyFormatter.format(montantNuiteesCalc)})
                            </p>
                        )}
                    </div>

                    {/* Montant effectif final */}
                    {montantEffectif !== null && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-emerald-800 font-medium">Montant final du séjour</span>
                                <span className="font-bold text-emerald-900">
                                    {currencyFormatter.format(montantEffectif)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Prorata pour les baux classiques */}
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
