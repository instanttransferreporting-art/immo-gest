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
import type { PaiementDTO } from "@/features/payments/types/payment.types";
import { useI18n } from "@/i18n/client";

type AnnulerPaiementButtonProps = {
    paiement: PaiementDTO;
};

export function AnnulerPaiementButton({ paiement }: AnnulerPaiementButtonProps) {
    const { t, f } = useI18n();

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
                {t.payments.cancel.trigger}
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{t.payments.cancel.title}</DialogTitle>
                </DialogHeader>

                {step === "motif" && (
                    <div className="space-y-4">
                        <div className="space-y-1.5 rounded-xl bg-muted px-3 py-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t.common.amount}</span>
                                <span className="font-medium text-foreground">
                                    {f.currency(paiement.montant)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t.common.date}</span>
                                <span className="font-medium text-foreground">
                                    {f.date(paiement.datePaiement)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t.payments.mode}</span>
                                <span className="font-medium text-foreground">
                                    {t.enums.modePaiement[paiement.mode]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="motif" className="text-sm font-medium text-foreground">
                                {t.payments.cancel.reason}
                            </label>
                            <Input
                                id="motif"
                                value={motif}
                                onChange={(event) => setMotif(event.target.value)}
                                placeholder={t.payments.cancel.reasonPlaceholder}
                                className="h-10 rounded-xl"
                            />
                            {motif.length > 0 && motif.length < 5 && (
                                <p className="animate-pulse text-sm text-red-500">
                                    {t.validation.reasonMin5}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            disabled={motif.trim().length < 5}
                            onClick={() => setStep("confirm")}
                            className="h-10 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        >
                            {t.payments.cancel.continue}
                        </Button>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="space-y-4">
                        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>{t.payments.cancel.warning(f.currency(paiement.montant))}</p>
                        </div>

                        <label className="flex items-start gap-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(event) => setConfirmed(event.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-input"
                            />
                            {t.payments.cancel.confirmCheckbox(f.currency(paiement.montant))}
                        </label>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 flex-1 rounded-xl"
                                onClick={() => setStep("motif")}
                            >
                                {t.common.back}
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
                                    t.payments.cancel.confirm
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
