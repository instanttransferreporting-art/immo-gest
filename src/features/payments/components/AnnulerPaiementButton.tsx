"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { annulerPaiement } from "@/features/payments/actions/paiement.actions";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

type AnnulerPaiementButtonProps = {
    paiement: PaiementDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function AnnulerPaiementButton({ paiement }: AnnulerPaiementButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"motif" | "confirm">("motif");
    const [motif, setMotif] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);

        if (!nextOpen) {
            setStep("motif");
            setMotif("");
            setConfirmed(false);
        }
    }

    async function handleConfirm() {
        setIsSubmitting(true);
        const result = await annulerPaiement({ paiementId: paiement.id, motif });
        setIsSubmitting(false);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        handleOpenChange(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button size="sm" variant="destructive" className="rounded-lg" />}>
                <Undo2 className="h-3.5 w-3.5" />
                Annuler
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Annuler le paiement</DialogTitle>
                </DialogHeader>

                {step === "motif" && (
                    <div className="space-y-4">
                        <div className="space-y-1.5 rounded-xl bg-muted px-3 py-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Montant</span>
                                <span className="font-medium text-foreground">
                                    {currencyFormatter.format(paiement.montant)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium text-foreground">
                                    {dateFormatter.format(paiement.datePaiement)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mode</span>
                                <span className="font-medium text-foreground">
                                    {MODE_PAIEMENT_LABELS[paiement.mode]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="motif" className="text-sm font-medium text-foreground">
                                Motif de l&apos;annulation
                            </label>
                            <Input
                                id="motif"
                                value={motif}
                                onChange={(event) => setMotif(event.target.value)}
                                placeholder="Ex : erreur de saisie, doublon..."
                                className="h-10 rounded-xl"
                            />
                            {motif.length > 0 && motif.length < 5 && (
                                <p className="animate-pulse text-sm text-red-500">
                                    Le motif doit contenir au moins 5 caractères.
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            disabled={motif.trim().length < 5}
                            onClick={() => setStep("confirm")}
                            className="h-10 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        >
                            Continuer
                        </Button>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="space-y-4">
                        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>
                                Vous êtes sur le point d&apos;annuler définitivement un paiement de{" "}
                                <strong>{currencyFormatter.format(paiement.montant)}</strong>. Le solde restant dû de
                                la facture sera recalculé. Cette action ne peut pas être défaite.
                            </p>
                        </div>

                        <label className="flex items-start gap-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(event) => setConfirmed(event.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-input"
                            />
                            Je confirme vouloir annuler ce paiement de {currencyFormatter.format(paiement.montant)}.
                        </label>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 flex-1 rounded-xl"
                                onClick={() => setStep("motif")}
                            >
                                Retour
                            </Button>

                            <Button
                                type="button"
                                disabled={!confirmed || isSubmitting}
                                onClick={handleConfirm}
                                className="h-10 flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Confirmer l'annulation"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
