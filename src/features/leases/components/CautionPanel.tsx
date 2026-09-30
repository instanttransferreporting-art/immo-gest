"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RestitutionCautionForm } from "@/features/leases/components/RestitutionCautionForm";
import { STATUT_CAUTION_LABELS, STATUT_CAUTION_STYLES } from "@/features/leases/constants/caution.constants";
import type { CautionDTO } from "@/features/leases/types/caution.types";
import { StatutBail } from "@/generated/prisma/enums";

type CautionPanelProps = {
    caution: CautionDTO;
    contratStatut: StatutBail;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function CautionPanel({ caution, contratStatut }: CautionPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const isSettled = caution.statut !== "EN_COURS";
    const isContratResilie = contratStatut === StatutBail.RESILIE;
    const canRestituer = !isSettled && isContratResilie;

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Caution</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                disabled={!canRestituer}
                                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            />
                        }
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Restituer
                    </DialogTrigger>

                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Solde de tout compte — Restitution de la caution</DialogTitle>
                        </DialogHeader>

                        <RestitutionCautionForm caution={caution} onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-3 px-6">
                {!isSettled && !isContratResilie && (
                    <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                        La caution ne pourra être restituée qu&apos;une fois le contrat résilié.
                    </p>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge className={`rounded-lg ${STATUT_CAUTION_STYLES[caution.statut]}`}>
                        {STATUT_CAUTION_LABELS[caution.statut]}
                    </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Montant initial</span>
                    <span className="font-medium text-foreground">
                        {currencyFormatter.format(caution.montantInitial)}
                    </span>
                </div>

                {isSettled && (
                    <>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Montant rendu</span>
                            <span className="font-medium text-foreground">
                                {currencyFormatter.format(caution.montantRendu)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Montant retenu</span>
                            <span className="font-medium text-foreground">
                                {currencyFormatter.format(caution.montantRetenu)}
                            </span>
                        </div>
                        {caution.dateRestitution && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Date de restitution</span>
                                <span className="font-medium text-foreground">
                                    {dateFormatter.format(caution.dateRestitution)}
                                </span>
                            </div>
                        )}
                        {caution.notes && (
                            <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                                {caution.notes}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
