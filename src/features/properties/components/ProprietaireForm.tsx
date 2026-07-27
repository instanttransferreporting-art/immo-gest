"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createProprietaire } from "@/features/properties/actions/proprietaire.actions";
import { proprietaireSchema, type ProprietaireFormValues } from "@/features/properties/schemas/property.schema";
import type { ProprietaireDTO } from "@/features/properties/types/property.types";

type ProprietaireFormProps = {
    onSuccess?: (proprietaire: ProprietaireDTO) => void;
};

const DEFAULT_VALUES: ProprietaireFormValues = {
    nom: "",
    prenom: "",
    adresse: "",
    ville: "",
    tauxCommission: 10,
    telephones: [{ numero: "", estPrincipal: true }],
    emails: [],
};

export function ProprietaireForm({ onSuccess }: ProprietaireFormProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProprietaireFormValues>({
        resolver: zodResolver(proprietaireSchema),
        defaultValues: DEFAULT_VALUES,
    });

    const telephones = useFieldArray({ control, name: "telephones" });
    const emails = useFieldArray({ control, name: "emails" });

    async function onSubmit(values: ProprietaireFormValues) {
        const result = await createProprietaire(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        reset();
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="nom" className="text-sm font-medium text-slate-900">
                        Nom
                    </label>
                    <Input
                        id="nom"
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="prenom" className="text-sm font-medium text-slate-900">
                        Prénom
                    </label>
                    <Input id="prenom" className="h-10 rounded-xl" {...register("prenom")} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="adresse" className="text-sm font-medium text-slate-900">
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
                    <label htmlFor="ville" className="text-sm font-medium text-slate-900">
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

            <div className="space-y-1.5">
                <label htmlFor="tauxCommission" className="text-sm font-medium text-slate-900">
                    Taux de commission (%)
                </label>
                <Input
                    id="tauxCommission"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    className={cn("h-10 rounded-xl", errors.tauxCommission && "border-red-500")}
                    {...register("tauxCommission", { valueAsNumber: true })}
                />
                {errors.tauxCommission && (
                    <p className="animate-pulse text-sm text-red-500">{errors.tauxCommission.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-900">Téléphones</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => telephones.append({ numero: "", estPrincipal: false })}
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </Button>
                </div>

                {telephones.fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="+237690000000"
                                className={cn(
                                    "h-10 rounded-xl",
                                    errors.telephones?.[index]?.numero && "border-red-500"
                                )}
                                {...register(`telephones.${index}.numero` as const)}
                            />
                            {errors.telephones?.[index]?.numero && (
                                <p className="mt-1 animate-pulse text-sm text-red-500">
                                    {errors.telephones[index]?.numero?.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 text-slate-400 hover:text-red-500"
                            disabled={telephones.fields.length === 1}
                            onClick={() => telephones.remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {errors.telephones?.root && (
                    <p className="animate-pulse text-sm text-red-500">{errors.telephones.root.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-900">Emails professionnels</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => emails.append({ email: "", estPrincipal: false })}
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </Button>
                </div>

                {emails.fields.length === 0 && (
                    <p className="text-sm text-slate-500">Aucun email professionnel ajouté.</p>
                )}

                {emails.fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-1">
                            <Input
                                type="email"
                                placeholder="contact@societe.com"
                                className={cn(
                                    "h-10 rounded-xl",
                                    errors.emails?.[index]?.email && "border-red-500"
                                )}
                                {...register(`emails.${index}.email` as const)}
                            />
                            {errors.emails?.[index]?.email && (
                                <p className="mt-1 animate-pulse text-sm text-red-500">
                                    {errors.emails[index]?.email?.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 text-slate-400 hover:text-red-500"
                            onClick={() => emails.remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le propriétaire"}
            </Button>
        </form>
    );
}
