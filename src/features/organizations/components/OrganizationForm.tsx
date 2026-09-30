"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { updateOrganization } from "@/features/organizations/actions/organization.actions";
import {
    organizationSchema,
    type OrganizationFormValues,
} from "@/features/organizations/schemas/organization.schema";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";

type OrganizationFormProps = {
    organization: OrganizationDTO;
    canEdit: boolean;
};

export function OrganizationForm({ organization, canEdit }: OrganizationFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            nom: organization.nom,
            logo: organization.logo ?? "",
            tauxCommissionDefaut: organization.tauxCommissionDefaut,
            tauxPenaliteRetard: organization.tauxPenaliteRetard,
            adresse: organization.adresse ?? "",
            ville: organization.ville ?? "",
            telephone: organization.telephone ?? "",
            email: organization.email ?? "",
        },
    });

    async function onSubmit(values: OrganizationFormValues) {
        const result = await updateOrganization(values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {!canEdit && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Seul un administrateur peut modifier les paramètres de l&apos;agence.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="nom" className="text-sm font-medium text-foreground">
                        Nom de l&apos;agence
                    </label>
                    <Input
                        id="nom"
                        disabled={!canEdit}
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="logo" className="text-sm font-medium text-foreground">
                        Logo (URL)
                    </label>
                    <Input
                        id="logo"
                        disabled={!canEdit}
                        className={cn("h-10 rounded-xl", errors.logo && "border-red-500")}
                        {...register("logo")}
                    />
                    {errors.logo && <p className="animate-pulse text-sm text-red-500">{errors.logo.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="tauxCommissionDefaut" className="text-sm font-medium text-foreground">
                        Taux de commission par défaut (%)
                    </label>
                    <Input
                        id="tauxCommissionDefaut"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        disabled={!canEdit}
                        className={cn("h-10 rounded-xl", errors.tauxCommissionDefaut && "border-red-500")}
                        {...register("tauxCommissionDefaut", { valueAsNumber: true })}
                    />
                    {errors.tauxCommissionDefaut && (
                        <p className="animate-pulse text-sm text-red-500">{errors.tauxCommissionDefaut.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="tauxPenaliteRetard" className="text-sm font-medium text-foreground">
                        Taux de pénalité de retard (%)
                    </label>
                    <Input
                        id="tauxPenaliteRetard"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        disabled={!canEdit}
                        className={cn("h-10 rounded-xl", errors.tauxPenaliteRetard && "border-red-500")}
                        {...register("tauxPenaliteRetard", { valueAsNumber: true })}
                    />
                    {errors.tauxPenaliteRetard && (
                        <p className="animate-pulse text-sm text-red-500">{errors.tauxPenaliteRetard.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Appliqué automatiquement au 2e rappel de relance (J+15).
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <Input
                        id="email"
                        disabled={!canEdit}
                        className={cn("h-10 rounded-xl", errors.email && "border-red-500")}
                        {...register("email")}
                    />
                    {errors.email && <p className="animate-pulse text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="telephone" className="text-sm font-medium text-foreground">
                        Téléphone
                    </label>
                    <Input
                        id="telephone"
                        disabled={!canEdit}
                        className="h-10 rounded-xl"
                        {...register("telephone")}
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="ville" className="text-sm font-medium text-foreground">
                        Ville
                    </label>
                    <Input id="ville" disabled={!canEdit} className="h-10 rounded-xl" {...register("ville")} />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="adresse" className="text-sm font-medium text-foreground">
                        Adresse
                    </label>
                    <Input id="adresse" disabled={!canEdit} className="h-10 rounded-xl" {...register("adresse")} />
                </div>
            </div>

            {canEdit && (
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </Button>
            )}
        </form>
    );
}
