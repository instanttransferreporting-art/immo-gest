"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createUnite } from "@/features/units/actions/unite.actions";
import { uniteSchema, type UniteFormValues } from "@/features/units/schemas/unit.schema";
import {
    FREQUENCE_PAIEMENT_LABELS,
    TYPE_CHARGES_LABELS,
    TYPE_UNITE_LABELS,
} from "@/features/units/constants/unit.constants";
import { FrequencePaiement, TypeCharges, TypeUnite } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";

type UniteFormProps = {
    immeubleId: string;
    onSuccess?: (unite: UniteDTO) => void;
};

export function UniteForm({ immeubleId, onSuccess }: UniteFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UniteFormValues>({
        resolver: zodResolver(uniteSchema) as unknown as Resolver<UniteFormValues>,
        defaultValues: {
            immeubleId,
            numero: "",
            type: TypeUnite.APPARTEMENT,
            typeCharges: TypeCharges.FORFAITAIRE,
            isMeuble: false,
            frequencePaiement: FrequencePaiement.MENSUEL,
        },
    });

    const typeCharges = watch("typeCharges");
    const frequencePaiement = watch("frequencePaiement");
    const isMeuble = watch("isMeuble");

    async function onSubmit(values: UniteFormValues) {
        const result = await createUnite(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        reset({
            immeubleId,
            numero: "",
            type: TypeUnite.APPARTEMENT,
            typeCharges: TypeCharges.FORFAITAIRE,
            isMeuble: false,
            frequencePaiement: FrequencePaiement.MENSUEL,
        });
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <input type="hidden" {...register("immeubleId")} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="numero" className="text-sm font-medium text-foreground">
                        Numéro
                    </label>
                    <Input
                        id="numero"
                        placeholder="A21"
                        className={cn("h-10 rounded-xl", errors.numero && "border-red-500")}
                        {...register("numero")}
                    />
                    {errors.numero && <p className="animate-pulse text-sm text-red-500">{errors.numero.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="type" className="text-sm font-medium text-foreground">
                        Type
                    </label>
                    <select
                        id="type"
                        className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...register("type")}
                    >
                        {Object.entries(TYPE_UNITE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="surface" className="text-sm font-medium text-foreground">
                        Surface (m²)
                    </label>
                    <Input
                        id="surface"
                        type="number"
                        min={0}
                        step="0.01"
                        className={cn("h-10 rounded-xl", errors.surface && "border-red-500")}
                        {...register("surface", { valueAsNumber: true })}
                    />
                    {errors.surface && <p className="animate-pulse text-sm text-red-500">{errors.surface.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="nombrePieces" className="text-sm font-medium text-foreground">
                        Nombre de pièces
                    </label>
                    <Input
                        id="nombrePieces"
                        type="number"
                        min={1}
                        className={cn("h-10 rounded-xl", errors.nombrePieces && "border-red-500")}
                        {...register("nombrePieces", { valueAsNumber: true })}
                    />
                    {errors.nombrePieces && (
                        <p className="animate-pulse text-sm text-red-500">{errors.nombrePieces.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="loyerMensuel" className="text-sm font-medium text-foreground">
                    Loyer de base
                </label>
                <Input
                    id="loyerMensuel"
                    type="number"
                    min={0}
                    className={cn("h-10 rounded-xl", errors.loyerMensuel && "border-red-500")}
                    {...register("loyerMensuel", { valueAsNumber: true })}
                />
                {errors.loyerMensuel && (
                    <p className="animate-pulse text-sm text-red-500">{errors.loyerMensuel.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="typeCharges" className="text-sm font-medium text-foreground">
                        Type de charges
                    </label>
                    <select
                        id="typeCharges"
                        className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...register("typeCharges")}
                    >
                        {Object.entries(TYPE_CHARGES_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="valeurCharges" className="text-sm font-medium text-foreground">
                        {typeCharges === TypeCharges.POURCENTAGE ? "Charges (% du loyer)" : "Charges (montant fixe)"}
                    </label>
                    <Input
                        id="valeurCharges"
                        type="number"
                        min={0}
                        max={typeCharges === TypeCharges.POURCENTAGE ? 100 : undefined}
                        className={cn("h-10 rounded-xl", errors.valeurCharges && "border-red-500")}
                        {...register("valeurCharges", { valueAsNumber: true })}
                    />
                    {errors.valeurCharges && (
                        <p className="animate-pulse text-sm text-red-500">{errors.valeurCharges.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="caution" className="text-sm font-medium text-foreground">
                    Caution (dépôt de garantie)
                </label>
                <Input
                    id="caution"
                    type="number"
                    min={0}
                    className={cn("h-10 rounded-xl", errors.caution && "border-red-500")}
                    {...register("caution", { valueAsNumber: true })}
                />
                {errors.caution && <p className="animate-pulse text-sm text-red-500">{errors.caution.message}</p>}
            </div>

            {/* Meublé toggle */}
            <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <input
                    id="isMeuble"
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-emerald-600"
                    {...register("isMeuble")}
                />
                <div>
                    <label htmlFor="isMeuble" className="text-sm font-medium text-foreground cursor-pointer">
                        Unité meublée
                    </label>
                    <p className="text-xs text-muted-foreground">
                        Cochez si cette unité est louée meublée (meubles inclus).
                    </p>
                </div>
                {isMeuble && (
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Meublé
                    </span>
                )}
            </div>

            {/* Fréquence de paiement */}
            <div className="space-y-1.5">
                <label htmlFor="frequencePaiement" className="text-sm font-medium text-foreground">
                    Fréquence de paiement
                </label>
                <select
                    id="frequencePaiement"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("frequencePaiement")}
                >
                    {Object.entries(FREQUENCE_PAIEMENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {frequencePaiement === FrequencePaiement.AUTRE && (
                <div className="space-y-1.5">
                    <label htmlFor="frequenceAutreTexte" className="text-sm font-medium text-foreground">
                        Précisez la fréquence
                    </label>
                    <Input
                        id="frequenceAutreTexte"
                        placeholder="Ex: Bimestriel, quinzaine…"
                        className={cn("h-10 rounded-xl", errors.frequenceAutreTexte && "border-red-500")}
                        {...register("frequenceAutreTexte")}
                    />
                    {errors.frequenceAutreTexte && (
                        <p className="animate-pulse text-sm text-red-500">{errors.frequenceAutreTexte.message}</p>
                    )}
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer l'unité"}
            </Button>
        </form>
    );
}
