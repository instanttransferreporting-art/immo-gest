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
import { STATUT_CAUTION_STYLES } from "@/features/leases/constants/caution.constants";
import type { CautionDTO } from "@/features/leases/types/caution.types";
import { StatutBail } from "@/generated/prisma/enums";
import { useI18n } from "@/i18n/client";

type CautionPanelProps = {
    caution: CautionDTO;
    contratStatut: StatutBail;
};

export function CautionPanel({ caution, contratStatut }: CautionPanelProps) {
    const { t, f } = useI18n();

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
                <CardTitle className="text-base font-semibold text-foreground">{t.leases.caution.title}</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                disabled={!canRestituer}
                                className="rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                            />
                        }
                    >
                        <ShieldCheck className="h-4 w-4" />
                        {t.leases.caution.restore}
                    </DialogTrigger>

                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>{t.leases.caution.dialogTitle}</DialogTitle>
                        </DialogHeader>

                        <RestitutionCautionForm caution={caution} onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-3 px-6">
                {!isSettled && !isContratResilie && (
                    <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {t.leases.caution.onlyAfterTermination}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.common.status}</span>
                    <Badge className={`rounded-lg ${STATUT_CAUTION_STYLES[caution.statut]}`}>
                        {t.enums.statutCaution[caution.statut]}
                    </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.leases.caution.initialAmount}</span>
                    <span className="font-medium text-foreground">
                        {f.currency(caution.montantInitial)}
                    </span>
                </div>

                {isSettled && (
                    <>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t.leases.caution.returnedAmount}</span>
                            <span className="font-medium text-foreground">
                                {f.currency(caution.montantRendu)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t.leases.caution.retainedAmount}</span>
                            <span className="font-medium text-foreground">
                                {f.currency(caution.montantRetenu)}
                            </span>
                        </div>
                        {caution.dateRestitution && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t.leases.caution.returnDate}</span>
                                <span className="font-medium text-foreground">
                                    {f.date(caution.dateRestitution)}
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
