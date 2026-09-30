"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";

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
import { renouvelerContrat } from "@/features/leases/actions/contrat.actions";
import { renouvellementSchema, type RenouvellementFormValues } from "@/features/leases/schemas/lease.schema";

type RenouvelerContratButtonProps = {
    contratId: string;
    loyerActuel: number;
    chargesActuelles: number;
    depotGarantieActuel: number;
};

export function RenouvelerContratButton({
    contratId,
    loyerActuel,
    chargesActuelles,
    depotGarantieActuel,
}: RenouvelerContratButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RenouvellementFormValues>({
        resolver: zodResolver(renouvellementSchema),
        defaultValues: {
            contratId,
            loyerBase: loyerActuel,
            charges: chargesActuelles,
            depotGarantie: depotGarantieActuel,
        },
    });

    async function onSubmit(values: RenouvellementFormValues) {
        const result = await renouvelerContrat(values);

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
            <DialogTrigger render={<Button variant="outline" className="rounded-lg" />}>
                <RefreshCw className="h-4 w-4" />
                Renouveler
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Renouveler le contrat</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <input type="hidden" {...register("contratId")} />

                    <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        Un nouveau contrat sera créé pour la période fiscale suivante, avec les mêmes conditions
                        (ajustables ci-dessous). L&apos;ancien contrat passera au statut Expiré.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label htmlFor="loyerBase" className="text-sm font-medium text-foreground">
                                Loyer de base
                            </label>
                            <Input
                                id="loyerBase"
                                type="number"
                                min={0}
                                className={cn("h-10 rounded-xl", errors.loyerBase && "border-red-500")}
                                {...register("loyerBase", { valueAsNumber: true })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="charges" className="text-sm font-medium text-foreground">
                                Charges
                            </label>
                            <Input
                                id="charges"
                                type="number"
                                min={0}
                                className={cn("h-10 rounded-xl", errors.charges && "border-red-500")}
                                {...register("charges", { valueAsNumber: true })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="depotGarantie" className="text-sm font-medium text-foreground">
                                Caution
                            </label>
                            <Input
                                id="depotGarantie"
                                type="number"
                                min={0}
                                className={cn("h-10 rounded-xl", errors.depotGarantie && "border-red-500")}
                                {...register("depotGarantie", { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le renouvellement"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
