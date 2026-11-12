"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createContrat } from "@/features/leases/actions/contrat.actions";
import { contratSchema, type ContratFormValues } from "@/features/leases/schemas/lease.schema";
import { calculateProrata } from "@/features/leases/services/prorata.calculator";
import { calculateDateFinAuto, calculateMontantContrat } from "@/features/leases/services/contrat-calculator";
import { computeChargesAmount } from "@/features/units/services/charges.calculator";
import { FrequenceEcheance, TypeLocataire } from "@/generated/prisma/enums";
import type { ContratDTO, LocataireOptionDTO, UniteLibreOptionDTO } from "@/features/leases/types/lease.types";
import { useI18n } from "@/i18n/client";

type ContratFormProps = {
    uniteOptions: readonly UniteLibreOptionDTO[];
    locataireOptions: readonly LocataireOptionDTO[];
    onSuccess?: (contrat: ContratDTO) => void;
};

// N'utilise pas toISOString() : ça convertit en UTC et peut décaler la date
// d'un jour selon le fuseau horaire local (ex: minuit WAT -> 23h UTC la veille).
const toDateInputValue = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Nombre de mois de loyer proposés pour la caution ; « personnalisé » = montant saisi à la main.
const DEPOSIT_MONTH_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
const DEFAULT_DEPOSIT_MONTHS_PHYSIQUE = 3;
const DEFAULT_DEPOSIT_MONTHS_MORALE = 2;

export function ContratForm({ uniteOptions, locataireOptions, onSuccess }: ContratFormProps) {
    const { t, tv, f } = useI18n();

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

    // null = montant de caution saisi manuellement
    const [moisCaution, setMoisCaution] = useState<number | null>(DEFAULT_DEPOSIT_MONTHS_PHYSIQUE);
    const chargesTouched = useRef(false);
    const dateFinTouched = useRef(false);

    const uniteId = watch("uniteId");
    const locataireId = watch("locataireId");
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

    // Sélection d'une unité : loyer et nature du logement préremplis.
    // Les charges et la caution sont recalculées par les effets ci-dessous.
    useEffect(() => {
        const selectedUnite = uniteOptions.find((option) => option.id === uniteId);

        if (selectedUnite) {
            chargesTouched.current = false;
            setValue("loyerBase", selectedUnite.loyerMensuel);
            setValue("isMeuble", selectedUnite.isMeuble);

            // Pré-sélectionner la fréquence selon l'unité si meublée
            if (selectedUnite.isMeuble && selectedUnite.frequencePaiement === "NUITEE") {
                setValue("frequence", FrequenceEcheance.QUOTIDIEN);
                setValue("depotGarantie", selectedUnite.caution);
                setMoisCaution(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniteId]);

    // Charges : calculées d'après l'unité (forfait ou % du loyer) tant qu'elles n'ont pas été modifiées à la main.
    useEffect(() => {
        const selectedUnite = uniteOptions.find((option) => option.id === uniteId);

        if (selectedUnite && !chargesTouched.current) {
            const loyer = Number.isFinite(loyerBase) ? loyerBase : 0;
            setValue(
                "charges",
                Math.round(
                    computeChargesAmount({
                        typeCharges: selectedUnite.typeCharges,
                        valeurCharges: selectedUnite.valeurCharges,
                        loyerMensuel: loyer,
                    })
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniteId, loyerBase]);

    // Nombre de mois de caution par défaut : 3 pour une personne physique, 2 pour une société.
    useEffect(() => {
        const selectedLocataire = locataireOptions.find((option) => option.id === locataireId);

        if (selectedLocataire && !isNuitee) {
            setMoisCaution(
                selectedLocataire.type === TypeLocataire.MORALE
                    ? DEFAULT_DEPOSIT_MONTHS_MORALE
                    : DEFAULT_DEPOSIT_MONTHS_PHYSIQUE
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locataireId]);

    // Caution = nombre de mois × loyer de base (sauf montant personnalisé et baux à la nuitée).
    useEffect(() => {
        if (moisCaution !== null && !isNuitee && Number.isFinite(loyerBase) && loyerBase > 0) {
            setValue("depotGarantie", moisCaution * loyerBase);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moisCaution, loyerBase, isNuitee]);

    // Date de fin proposée : 31 décembre de l'année de début. Modifiable ; on ne l'écrase plus une fois modifiée.
    useEffect(() => {
        if (!isNuitee && !dateFinTouched.current && dateDebut instanceof Date && !Number.isNaN(dateDebut.getTime())) {
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
        chargesTouched.current = false;
        dateFinTouched.current = false;
        setMoisCaution(DEFAULT_DEPOSIT_MONTHS_PHYSIQUE);
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Unité */}
            <div className="space-y-1.5">
                <label htmlFor="uniteId" className="text-sm font-medium text-foreground">
                    {t.leases.form.freeUnit}
                </label>
                <select
                    id="uniteId"
                    className={cn(
                        "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.uniteId && "border-red-500"
                    )}
                    {...register("uniteId")}
                >
                    <option value="">{t.leases.form.selectUnit}</option>
                    {uniteOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.immeuble.nom} — {option.numero}
                            {option.isMeuble ? t.leases.form.furnishedSuffix : ""}
                        </option>
                    ))}
                </select>
                {errors.uniteId && <p className="animate-pulse text-sm text-red-500">{tv(errors.uniteId.message)}</p>}
            </div>

            {/* Nature du logement */}
            <div className="space-y-1.5">
                <label htmlFor="isMeuble" className="text-sm font-medium text-foreground">
                    {t.leases.form.housingType}
                </label>
                <select
                    id="isMeuble"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("isMeuble", { setValueAs: (value) => value === true || value === "true" })}
                >
                    <option value="false">{t.leases.form.unfurnished}</option>
                    <option value="true">{t.leases.form.furnished}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                    {t.leases.form.housingTypeHint}
                </p>
            </div>

            {/* Locataire */}
            <div className="space-y-1.5">
                <label htmlFor="locataireId" className="text-sm font-medium text-foreground">
                    {t.leases.tenant}
                </label>
                <select
                    id="locataireId"
                    className={cn(
                        "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.locataireId && "border-red-500"
                    )}
                    {...register("locataireId")}
                >
                    <option value="">{t.leases.form.selectTenant}</option>
                    {locataireOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.raisonSociale ?? `${option.nom} ${option.prenom}`}
                        </option>
                    ))}
                </select>
                {errors.locataireId && (
                    <p className="animate-pulse text-sm text-red-500">{tv(errors.locataireId.message)}</p>
                )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="dateDebut" className="text-sm font-medium text-foreground">
                        {t.leases.form.startDate}
                    </label>
                    <Input
                        id="dateDebut"
                        type="date"
                        defaultValue={toDateInputValue(new Date())}
                        className={cn("h-10 rounded-xl", errors.dateDebut && "border-red-500")}
                        {...register("dateDebut", { setValueAs: (value) => (value ? new Date(value) : new Date("")) })}
                    />
                    {errors.dateDebut && (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.dateDebut.message)}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="dateFin" className="text-sm font-medium text-foreground">
                        {t.leases.form.endDate}
                    </label>
                    <Controller
                        control={control}
                        name="dateFin"
                        render={({ field }) => (
                            <Input
                                id="dateFin"
                                type="date"
                                className={cn("h-10 rounded-xl", errors.dateFin && "border-red-500")}
                                value={
                                    field.value instanceof Date && !Number.isNaN(field.value.getTime())
                                        ? toDateInputValue(field.value)
                                        : ""
                                }
                                onChange={(event) => {
                                    dateFinTouched.current = true;
                                    field.onChange(event.target.value ? new Date(event.target.value) : new Date(""));
                                }}
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                    {errors.dateFin ? (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.dateFin.message)}</p>
                    ) : (
                        !isNuitee && <p className="text-xs text-muted-foreground">{t.leases.form.endDateAuto}</p>
                    )}
                </div>
            </div>

            {/* Loyer, charges */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="loyerBase" className="text-sm font-medium text-foreground">
                        {isNuitee ? t.leases.form.nightlyRate : t.leases.baseRent}
                    </label>
                    <Input
                        id="loyerBase"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.loyerBase && "border-red-500")}
                        {...register("loyerBase", { valueAsNumber: true })}
                    />
                    {errors.loyerBase && (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.loyerBase.message)}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="charges" className="text-sm font-medium text-foreground">
                        {t.leases.charges}
                    </label>
                    <Input
                        id="charges"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.charges && "border-red-500")}
                        {...register("charges", {
                            valueAsNumber: true,
                            onChange: () => {
                                chargesTouched.current = true;
                            },
                        })}
                    />
                    {errors.charges && <p className="animate-pulse text-sm text-red-500">{tv(errors.charges.message)}</p>}
                </div>

            </div>

            {/* Caution : nombre de mois de loyer + montant (modifiable à la main) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="moisCaution" className="text-sm font-medium text-foreground">
                        {t.leases.form.depositMonths}
                    </label>
                    <select
                        id="moisCaution"
                        value={moisCaution === null ? "custom" : String(moisCaution)}
                        onChange={(event) =>
                            setMoisCaution(event.target.value === "custom" ? null : Number(event.target.value))
                        }
                        className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        {DEPOSIT_MONTH_OPTIONS.map((months) => (
                            <option key={months} value={months}>
                                {t.leases.form.depositMonthsOption(months)}
                            </option>
                        ))}
                        <option value="custom">{t.leases.form.depositCustom}</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                        {moisCaution !== null && Number.isFinite(loyerBase) && loyerBase > 0
                            ? t.leases.form.depositMonthsHint(moisCaution, f.currency(loyerBase))
                            : t.leases.form.depositMonthsDefaultHint}
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="depotGarantie" className="text-sm font-medium text-foreground">
                        {t.leases.deposit}
                    </label>
                    <Input
                        id="depotGarantie"
                        type="number"
                        min={0}
                        className={cn("h-10 rounded-xl", errors.depotGarantie && "border-red-500")}
                        {...register("depotGarantie", {
                            valueAsNumber: true,
                            onChange: () => setMoisCaution(null),
                        })}
                    />
                    {errors.depotGarantie && (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.depotGarantie.message)}</p>
                    )}
                </div>
            </div>

            {/* Fréquence */}
            <div className="space-y-1.5">
                <label htmlFor="frequence" className="text-sm font-medium text-foreground">
                    {t.leases.paymentFrequency}
                </label>
                <select
                    id="frequence"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("frequence")}
                >
                    {Object.entries(t.enums.frequenceEcheance).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                {frequence && (
                    <p className="text-xs text-muted-foreground">{t.leases.form.frequencyDescriptions[frequence as FrequenceEcheance]}</p>
                )}
            </div>

            {/* Section nuitées — visible uniquement si QUOTIDIEN */}
            {isNuitee && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-4">
                    <p className="text-sm font-medium text-amber-800">
                        {t.leases.form.nightlyMode}
                    </p>

                    <div className="space-y-1.5">
                        <label htmlFor="nombreNuitees" className="text-sm font-medium text-foreground">
                            {t.leases.form.nightsCount}
                        </label>
                        <Input
                            id="nombreNuitees"
                            type="number"
                            min={1}
                            className={cn("h-10 rounded-xl bg-background", errors.nombreNuitees && "border-red-500")}
                            {...register("nombreNuitees", { valueAsNumber: true })}
                        />
                        {errors.nombreNuitees && (
                            <p className="animate-pulse text-sm text-red-500">{tv(errors.nombreNuitees.message)}</p>
                        )}
                    </div>

                    {/* Affichage du montant calculé */}
                    {montantNuiteesCalc !== null && (
                        <div className="rounded-lg bg-card border border-amber-200 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t.leases.form.computedAmount}</span>
                                <span className="font-semibold text-amber-800">
                                    {f.currency(montantNuiteesCalc)}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {t.leases.form.nightsTimesRate(nombreNuitees ?? 0, f.currency(loyerBase))}
                            </p>
                        </div>
                    )}

                    {/* Override montant */}
                    <div className="space-y-1.5">
                        <label htmlFor="montantTotalOverride" className="text-sm font-medium text-foreground">
                            {t.leases.form.totalOverride}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">{t.leases.form.optionalSuffix}</span>
                        </label>
                        <Input
                            id="montantTotalOverride"
                            type="number"
                            min={0}
                            placeholder={
                                montantNuiteesCalc !== null
                                    ? t.leases.form.computedPlaceholder(f.currency(montantNuiteesCalc))
                                    : t.leases.form.customAmountPlaceholder
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
                                {tv(errors.montantTotalOverride.message)}
                            </p>
                        )}
                        {montantTotalOverride && montantNuiteesCalc !== null && (
                            <p className="text-xs text-amber-600">
                                {t.leases.form.manualAmountWarning(f.currency(montantTotalOverride), f.currency(montantNuiteesCalc))}
                            </p>
                        )}
                    </div>

                    {/* Montant effectif final */}
                    {montantEffectif !== null && (
                        <div className="rounded-lg bg-brand-50 border border-brand-200 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-brand-800 font-medium">{t.leases.form.finalStayAmount}</span>
                                <span className="font-bold text-brand-900">
                                    {f.currency(montantEffectif)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Prorata pour les baux classiques */}
            {prorata !== null && (
                <div className="rounded-xl bg-brand-50 p-4 text-sm">
                    <p className="font-medium text-brand-800">{t.leases.form.prorataTitle}</p>
                    <p className="mt-1 text-brand-700">
                        {f.currency(prorata)}
                        {prorata !== loyerBase && (
                            <span className="text-brand-600">{t.leases.form.insteadOf(f.currency(loyerBase))}</span>
                        )}
                    </p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.leases.form.submit}
            </Button>
        </form>
    );
}
