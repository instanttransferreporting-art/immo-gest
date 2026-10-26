"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createPaiement } from "@/features/payments/actions/paiement.actions";
import { paiementSchema, type PaiementFormValues } from "@/features/payments/schemas/payment.schema";
import { ModePaiement } from "@/generated/prisma/enums";
import type { PaiementDTO } from "@/features/payments/types/payment.types";
import { useI18n } from "@/i18n/client";

type PaiementFormProps = {
    factureId: string;
    soldeRestant: number;
    onSuccess?: (paiement: PaiementDTO) => void;
};

export function PaiementForm({ factureId, soldeRestant, onSuccess }: PaiementFormProps) {
    const { t, tv, f } = useI18n();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PaiementFormValues>({
        resolver: zodResolver(paiementSchema),
        defaultValues: {
            factureId,
            mode: ModePaiement.MOBILE_MONEY,
        },
    });

    async function onSubmit(values: PaiementFormValues) {
        const result = await createPaiement(values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        reset({ factureId, mode: ModePaiement.MOBILE_MONEY });
        onSuccess?.(result.data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <input type="hidden" {...register("factureId")} />

            <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {t.payments.balanceDueColon} <span className="font-semibold text-foreground">{f.currency(soldeRestant)}</span>
            </p>

            <div className="space-y-1.5">
                <label htmlFor="mode" className="text-sm font-medium text-foreground">
                    {t.payments.paymentMode}
                </label>
                <select
                    id="mode"
                    className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("mode")}
                >
                    {Object.entries(t.enums.modePaiement).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="montant" className="text-sm font-medium text-foreground">
                    {t.payments.amountReceived}
                </label>
                <Input
                    id="montant"
                    type="number"
                    min={0}
                    max={soldeRestant}
                    className={cn("h-10 rounded-xl", errors.montant && "border-red-500")}
                    {...register("montant", { valueAsNumber: true })}
                />
                {errors.montant && <p className="animate-pulse text-sm text-red-500">{tv(errors.montant.message)}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="reference" className="text-sm font-medium text-foreground">
                    {t.payments.referenceLong}
                </label>
                <Input id="reference" className="h-10 rounded-xl" {...register("reference")} />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.payments.submit}
            </Button>
        </form>
    );
}
