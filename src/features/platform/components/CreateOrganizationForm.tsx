"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createOrganization } from "@/features/platform/actions/platform.actions";
import {
    createOrganizationSchema,
    type CreateOrganizationFormValues,
} from "@/features/platform/schemas/platform.schema";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";

type CreateOrganizationFormProps = {
    onSuccess?: (organization: OrganizationSummaryDTO) => void;
};

export function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CreateOrganizationFormValues>({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            tauxCommissionDefaut: 10,
        },
    });

    async function onSubmit(values: CreateOrganizationFormValues) {
        const result = await createOrganization(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });

            if (result.errors) {
                for (const [field, messages] of Object.entries(result.errors)) {
                    setError(field as keyof CreateOrganizationFormValues, { message: messages[0] });
                }
            }

            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="nom" className="text-sm font-medium text-foreground">
                        Nom de l&apos;entreprise
                    </label>
                    <Input
                        id="nom"
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="tauxCommissionDefaut" className="text-sm font-medium text-foreground">
                        Taux de commission (%)
                    </label>
                    <Input
                        id="tauxCommissionDefaut"
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
            </div>

            <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium text-foreground">Compte administrateur de l&apos;entreprise</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="adminPrenom" className="text-sm font-medium text-foreground">
                            Prénom
                        </label>
                        <Input
                            id="adminPrenom"
                            className={cn("h-10 rounded-xl", errors.adminPrenom && "border-red-500")}
                            {...register("adminPrenom")}
                        />
                        {errors.adminPrenom && (
                            <p className="animate-pulse text-sm text-red-500">{errors.adminPrenom.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="adminNom" className="text-sm font-medium text-foreground">
                            Nom
                        </label>
                        <Input
                            id="adminNom"
                            className={cn("h-10 rounded-xl", errors.adminNom && "border-red-500")}
                            {...register("adminNom")}
                        />
                        {errors.adminNom && (
                            <p className="animate-pulse text-sm text-red-500">{errors.adminNom.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="adminEmail" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <Input
                            id="adminEmail"
                            type="email"
                            className={cn("h-10 rounded-xl", errors.adminEmail && "border-red-500")}
                            {...register("adminEmail")}
                        />
                        {errors.adminEmail && (
                            <p className="animate-pulse text-sm text-red-500">{errors.adminEmail.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="adminPassword" className="text-sm font-medium text-foreground">
                            Mot de passe initial
                        </label>
                        <Input
                            id="adminPassword"
                            type="password"
                            className={cn("h-10 rounded-xl", errors.adminPassword && "border-red-500")}
                            {...register("adminPassword")}
                        />
                        {errors.adminPassword && (
                            <p className="animate-pulse text-sm text-red-500">{errors.adminPassword.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer l'entreprise"}
            </Button>
        </form>
    );
}
