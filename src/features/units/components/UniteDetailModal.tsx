"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FrequencePaiement } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";
import { useI18n } from "@/i18n/client";

type UniteDetailModalProps = {
    unite: UniteDTO;
};

const etatVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LIBRE: "default",
    OCCUPE: "destructive",
    RESERVE: "secondary",
};

export function UniteDetailModal({ unite }: UniteDetailModalProps) {
    const { t, f } = useI18n();

    const [open, setOpen] = useState(false);

    const frequenceLabel =
        unite.frequencePaiement === FrequencePaiement.AUTRE && unite.frequenceAutreTexte
            ? unite.frequenceAutreTexte
            : t.enums.frequencePaiement[unite.frequencePaiement];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-border text-muted-foreground hover:text-blue-700"
                    />
                }
            >
                <Eye className="h-4 w-4" />
                {t.common.details}
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {t.units.unitTitle(unite.numero)}
                        <Badge
                            variant={etatVariant[unite.etat] ?? "outline"}
                            className="rounded-lg text-xs"
                        >
                            {t.enums.etatUnite[unite.etat]}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.common.type}</dt>
                        <dd className="font-medium text-foreground">{t.enums.typeUnite[unite.type]}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.surface}</dt>
                        <dd className="font-medium text-foreground">{unite.surface} m²</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.rooms}</dt>
                        <dd className="font-medium text-foreground">{unite.nombrePieces}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.baseRent}</dt>
                        <dd className="font-medium text-foreground">
                            {f.currency(unite.loyerMensuel)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.chargesWithType(t.enums.typeCharges[unite.typeCharges])}</dt>
                        <dd className="font-medium text-foreground">
                            {unite.typeCharges === "POURCENTAGE"
                                ? `${unite.valeurCharges}%`
                                : f.currency(unite.valeurCharges)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.deposit}</dt>
                        <dd className="font-medium text-foreground">
                            {f.currency(unite.caution)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.units.paymentFrequency}</dt>
                        <dd className="font-medium text-foreground">{frequenceLabel}</dd>
                    </div>

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">{t.units.furnishedFeminine}</dt>
                        <dd className="font-medium text-foreground">
                            {unite.isMeuble ? (
                                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                                    {t.common.yes}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">{t.common.no}</span>
                            )}
                        </dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
