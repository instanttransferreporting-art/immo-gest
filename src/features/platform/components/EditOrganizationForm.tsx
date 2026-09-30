"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { organizationSchema, type OrganizationFormValues } from "@/features/organizations/schemas/organization.schema";
import { updateOrganization } from "@/features/platform/actions/platform.actions";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";

type EditOrganizationFormProps = {
    organization: OrganizationSummaryDTO;
    onSuccess?: () => void;
};

export function EditOrganizationForm({ organization, onSuccess }: EditOrganizationFormProps) {
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
        const result = await updateOrganization(organization.id, values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="edit-nom" className="text-sm font-medium text-foreground">
                        Nom de l&apos;agence
                    </label>
                    <Input
                        id="edit-nom"
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-logo" className="text-sm font-medium text-foreground">
                        Logo (URL)
                    </label>
                    <Input id="edit-logo" className="h-10 rounded-xl" {...register("logo")} />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-tauxCommissionDefaut" className="text-sm font-medium text-foreground">
                        Taux de commission (%)
                    </label>
                    <Input
                        id="edit-tauxCommissionDefaut"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        className={cn("h-10 rounded-xl", errors.tauxCommissionDefaut && "border-red-500")}
                        {...register("tauxCommissionDefaut", { valueAsNumber: true })}
                    />
                    {errors.tauxCommissionDefaut && (
                        <p className="animate-pulse text-sm text-red-500">{errors.tauxCommissionDefaut.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-tauxPenaliteRetard" className="text-sm font-medium text-foreground">
                        Taux de pénalité de retard (%)
                    </label>
                    <Input
                        id="edit-tauxPenaliteRetard"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        className={cn("h-10 rounded-xl", errors.tauxPenaliteRetard && "border-red-500")}
                        {...register("tauxPenaliteRetard", { valueAsNumber: true })}
                    />
                    {errors.tauxPenaliteRetard && (
                        <p className="animate-pulse text-sm text-red-500">{errors.tauxPenaliteRetard.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <Input
                        id="edit-email"
                        className={cn("h-10 rounded-xl", errors.email && "border-red-500")}
                        {...register("email")}
                    />
                    {errors.email && <p className="animate-pulse text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-telephone" className="text-sm font-medium text-foreground">
                        Téléphone
                    </label>
                    <Input id="edit-telephone" className="h-10 rounded-xl" {...register("telephone")} />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-ville" className="text-sm font-medium text-foreground">
                        Ville
                    </label>
                    <Input id="edit-ville" className="h-10 rounded-xl" {...register("ville")} />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="edit-adresse" className="text-sm font-medium text-foreground">
                        Adresse
                    </label>
                    <Input id="edit-adresse" className="h-10 rounded-xl" {...register("adresse")} />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
        </form>
    );
}
