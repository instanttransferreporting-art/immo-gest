"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createImmeuble } from "@/features/properties/actions/immeuble.actions";
import { immeubleSchema, type ImmeubleFormValues } from "@/features/properties/schemas/property.schema";
import type { ImmeubleDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";

type ImmeubleFormProps = {
    proprietaireOptions: readonly ProprietaireOptionDTO[];
    onSuccess?: (immeuble: ImmeubleDTO) => void;
};

const DEFAULT_VALUES: Partial<ImmeubleFormValues> = {
    nom: "",
    adresse: "",
    ville: "",
    proprietaireId: "",
};

export function ImmeubleForm({ proprietaireOptions, onSuccess }: ImmeubleFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ImmeubleFormValues>({
        resolver: zodResolver(immeubleSchema),
        defaultValues: DEFAULT_VALUES,
    });

    async function onSubmit(values: ImmeubleFormValues) {
        const result = await createImmeuble(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({
            title: result.message,
            description: `Référence : ${result.data.reference}`,
            type: "success",
        });
        reset();
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="proprietaireId" className="text-sm font-medium text-foreground">
                    Propriétaire
                </label>
                <select
                    id="proprietaireId"
                    className={cn(
                        "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        errors.proprietaireId && "border-red-500"
                    )}
                    {...register("proprietaireId")}
                >
                    <option value="">Sélectionner un propriétaire</option>
                    {proprietaireOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {`${option.nom} ${option.prenom ?? ""}`.trim()}
                        </option>
                    ))}
                </select>
                {errors.proprietaireId && (
                    <p className="animate-pulse text-sm text-red-500">{errors.proprietaireId.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="nom" className="text-sm font-medium text-foreground">
                    Nom de l&apos;immeuble
                </label>
                <Input
                    id="nom"
                    className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                    {...register("nom")}
                />
                {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="adresse" className="text-sm font-medium text-foreground">
                        Adresse
                    </label>
                    <Input
                        id="adresse"
                        className={cn("h-10 rounded-xl", errors.adresse && "border-red-500")}
                        {...register("adresse")}
                    />
                    {errors.adresse && <p className="animate-pulse text-sm text-red-500">{errors.adresse.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="ville" className="text-sm font-medium text-foreground">
                        Ville
                    </label>
                    <Input
                        id="ville"
                        className={cn("h-10 rounded-xl", errors.ville && "border-red-500")}
                        {...register("ville")}
                    />
                    {errors.ville && <p className="animate-pulse text-sm text-red-500">{errors.ville.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <label htmlFor="nombreNiveaux" className="text-sm font-medium text-foreground">
                        Niveaux
                    </label>
                    <Input
                        id="nombreNiveaux"
                        type="number"
                        min={1}
                        className={cn("h-10 rounded-xl", errors.nombreNiveaux && "border-red-500")}
                        {...register("nombreNiveaux", { valueAsNumber: true })}
                    />
                    {errors.nombreNiveaux && (
                        <p className="animate-pulse text-sm text-red-500">{errors.nombreNiveaux.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="nombreLogements" className="text-sm font-medium text-foreground">
                        Logements
                    </label>
                    <Input
                        id="nombreLogements"
                        type="number"
                        min={1}
                        className={cn("h-10 rounded-xl", errors.nombreLogements && "border-red-500")}
                        {...register("nombreLogements", { valueAsNumber: true })}
                    />
                    {errors.nombreLogements && (
                        <p className="animate-pulse text-sm text-red-500">{errors.nombreLogements.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="valeurEstimative" className="text-sm font-medium text-foreground">
                        Valeur estimative
                    </label>
                    <Input
                        id="valeurEstimative"
                        type="number"
                        min={0}
                        className="h-10 rounded-xl"
                        {...register("valeurEstimative", {
                            setValueAs: (value) => (value === "" ? undefined : Number(value)),
                        })}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer l'immeuble"}
            </Button>
        </form>
    );
}
