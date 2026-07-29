"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileWarning, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { resilierContrat } from "@/features/leases/actions/contrat.actions";
import { resiliationSchema, type ResiliationFormValues } from "@/features/leases/schemas/lease.schema";

type ResilierContratButtonProps = {
    contratId: string;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export function ResilierContratButton({ contratId }: ResilierContratButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResiliationFormValues>({
        resolver: zodResolver(resiliationSchema),
        defaultValues: {
            contratId,
        },
    });

    async function onSubmit(values: ResiliationFormValues) {
        const result = await resilierContrat(values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        setOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={<Button variant="destructive" className="rounded-lg" />}
            >
                <FileWarning className="h-4 w-4" />
                Résilier le contrat
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Résilier le contrat</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <input type="hidden" {...register("contratId")} />

                    <div className="space-y-1.5">
                        <label htmlFor="dateFin" className="text-sm font-medium text-slate-900">
                            Date de sortie effective
                        </label>
                        <Input
                            id="dateFin"
                            type="date"
                            defaultValue={toDateInputValue(new Date())}
                            className={cn("h-10 rounded-xl", errors.dateFin && "border-red-500")}
                            {...register("dateFin", {
                                setValueAs: (value) => (value ? new Date(value) : new Date("")),
                            })}
                        />
                        {errors.dateFin && (
                            <p className="animate-pulse text-sm text-red-500">{errors.dateFin.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="motif" className="text-sm font-medium text-slate-900">
                            Motif (optionnel)
                        </label>
                        <Input id="motif" className="h-10 rounded-xl" {...register("motif")} />
                    </div>

                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        L&apos;unité sera immédiatement remise disponible pour un nouveau bail.
                    </p>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la résiliation"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
