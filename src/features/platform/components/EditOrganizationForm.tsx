"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { organizationSchema, type OrganizationFormValues } from "@/features/organizations/schemas/organization.schema";
import {
    removeOrganizationLogoById,
    updateOrganization,
    uploadOrganizationLogoById,
} from "@/features/platform/actions/platform.actions";
import { OrganizationLogoUploader } from "@/features/organizations/components/OrganizationLogoUploader";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";
import { useI18n } from "@/i18n/client";

type EditOrganizationFormProps = {
    organization: OrganizationSummaryDTO;
    onSuccess?: () => void;
};

export function EditOrganizationForm({ organization, onSuccess }: EditOrganizationFormProps) {
    const { t, tv } = useI18n();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            nom: organization.nom,
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
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{t.admin.settings.appLogo}</p>
                <OrganizationLogoUploader
                    kind="sidebar"
                    logo={organization.logo}
                    organizationNom={organization.nom}
                    canEdit
                    onUpload={(formData) => uploadOrganizationLogoById(organization.id, formData)}
                    onRemove={(kind) => removeOrganizationLogoById(organization.id, kind)}
                />
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{t.admin.settings.documentLogo}</p>
                <OrganizationLogoUploader
                    kind="document"
                    logo={organization.logoDocument}
                    organizationNom={organization.nom}
                    canEdit
                    onUpload={(formData) => uploadOrganizationLogoById(organization.id, formData)}
                    onRemove={(kind) => removeOrganizationLogoById(organization.id, kind)}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t border-border pt-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="edit-nom" className="text-sm font-medium text-foreground">
                            {t.admin.settings.agencyName}
                        </label>
                        <Input
                            id="edit-nom"
                            className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                            {...register("nom")}
                        />
                        {errors.nom && <p className="animate-pulse text-sm text-red-500">{tv(errors.nom.message)}</p>}
                    </div>


                    <div className="space-y-1.5">
                        <label htmlFor="edit-tauxCommissionDefaut" className="text-sm font-medium text-foreground">
                            {t.admin.platform.commissionRate}
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
                            <p className="animate-pulse text-sm text-red-500">{tv(errors.tauxCommissionDefaut.message)}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-tauxPenaliteRetard" className="text-sm font-medium text-foreground">
                            {t.admin.settings.penaltyRate}
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
                            <p className="animate-pulse text-sm text-red-500">{tv(errors.tauxPenaliteRetard.message)}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-email" className="text-sm font-medium text-foreground">
                            {t.common.email}
                        </label>
                        <Input
                            id="edit-email"
                            className={cn("h-10 rounded-xl", errors.email && "border-red-500")}
                            {...register("email")}
                        />
                        {errors.email && <p className="animate-pulse text-sm text-red-500">{tv(errors.email.message)}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-telephone" className="text-sm font-medium text-foreground">
                            {t.common.phone}
                        </label>
                        <Input id="edit-telephone" className="h-10 rounded-xl" {...register("telephone")} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-ville" className="text-sm font-medium text-foreground">
                            {t.common.city}
                        </label>
                        <Input id="edit-ville" className="h-10 rounded-xl" {...register("ville")} />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="edit-adresse" className="text-sm font-medium text-foreground">
                            {t.common.address}
                        </label>
                        <Input id="edit-adresse" className="h-10 rounded-xl" {...register("adresse")} />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
                </Button>
            </form>
        </div>
    );
}
