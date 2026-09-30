"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PaiementForm } from "@/features/payments/components/PaiementForm";
import { PaiementsHistoryTable } from "@/features/payments/components/PaiementsHistoryTable";
import { QuittanceApercu } from "@/features/payments/components/QuittanceApercu";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

type FactureDetailPanelProps = {
    facture: FactureDTO;
    paiements: readonly PaiementDTO[];
};

export function FactureDetailPanel({ facture, paiements }: FactureDetailPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const isSoldee = facture.soldeRestant <= 0;

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-6">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Historique des paiements
                    </CardTitle>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger
                            render={
                                <Button
                                    size="sm"
                                    disabled={isSoldee}
                                    className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                />
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Enregistrer un paiement
                        </DialogTrigger>

                        <DialogContent className="max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Enregistrer un paiement</DialogTitle>
                            </DialogHeader>

                            <PaiementForm
                                factureId={facture.id}
                                soldeRestant={facture.soldeRestant}
                                onSuccess={handleSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="px-6">
                    {isSoldee && (
                        <p className="mb-3 text-sm text-emerald-600">Cette facture est intégralement payée.</p>
                    )}
                    <PaiementsHistoryTable paiements={paiements} />
                </CardContent>
            </Card>

            <QuittanceApercu facture={facture} paiements={paiements} />
        </div>
    );
}
