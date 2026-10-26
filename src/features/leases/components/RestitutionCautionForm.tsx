"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { restituerCaution } from "@/features/leases/actions/caution.actions";
import {
    restitutionCautionSchema,
    type RestitutionCautionFormValues,
} from "@/features/leases/schemas/caution.schema";
import type { CautionDTO } from "@/features/leases/types/caution.types";
import { useI18n } from "@/i18n/client";

type RestitutionCautionFormProps = {
    caution: CautionDTO;
    onSuccess?: (caution: CautionDTO) => void;
};

export function RestitutionCautionForm({ caution, onSuccess }: RestitutionCautionFormProps) {
    const { t, tv, f } = useI18n();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RestitutionCautionFormValues>({
        resolver: zodResolver(restitutionCautionSchema),
        defaultValues: {
            cautionId: caution.id,
        },
    });

    async function onSubmit(values: RestitutionCautionFormValues) {
        const result = await restituerCaution(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <input type="hidden" {...register("cautionId")} />

            <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {t.leases.caution.initialAmountColon}{" "}
                <span className="font-semibold text-foreground">
                    {f.currency(caution.montantInitial)}
                </span>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="montantRendu" className="text-sm font-medium text-foreground">
                        {t.leases.caution.returnedAmount}
                    </label>
                    <Input
                        id="montantRendu"
                        type="number"
                        min={0}
                        max={caution.montantInitial}
                        className={cn("h-10 rounded-xl", errors.montantRendu && "border-red-500")}
                        {...register("montantRendu", { valueAsNumber: true })}
                    />
                    {errors.montantRendu && (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.montantRendu.message)}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="montantRetenu" className="text-sm font-medium text-foreground">
                        {t.leases.caution.retainedAmountWorks}
                    </label>
                    <Input
                        id="montantRetenu"
                        type="number"
                        min={0}
                        max={caution.montantInitial}
                        className={cn("h-10 rounded-xl", errors.montantRetenu && "border-red-500")}
                        {...register("montantRetenu", { valueAsNumber: true })}
                    />
                    {errors.montantRetenu && (
                        <p className="animate-pulse text-sm text-red-500">{tv(errors.montantRetenu.message)}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                    {t.leases.caution.notes}
                </label>
                <Input id="notes" className="h-10 rounded-xl" {...register("notes")} />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.leases.caution.submit}
            </Button>
        </form>
    );
}
