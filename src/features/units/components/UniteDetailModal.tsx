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
import {
    ETAT_UNITE_LABELS,
    FREQUENCE_PAIEMENT_LABELS,
    TYPE_CHARGES_LABELS,
    TYPE_UNITE_LABELS,
} from "@/features/units/constants/unit.constants";
import { FrequencePaiement } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";

type UniteDetailModalProps = {
    unite: UniteDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const etatVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LIBRE: "default",
    OCCUPE: "destructive",
    RESERVE: "secondary",
};

export function UniteDetailModal({ unite }: UniteDetailModalProps) {
    const [open, setOpen] = useState(false);

    const frequenceLabel =
        unite.frequencePaiement === FrequencePaiement.AUTRE && unite.frequenceAutreTexte
            ? unite.frequenceAutreTexte
            : FREQUENCE_PAIEMENT_LABELS[unite.frequencePaiement];

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
                Détail
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Unité {unite.numero}
                        <Badge
                            variant={etatVariant[unite.etat] ?? "outline"}
                            className="rounded-lg text-xs"
                        >
                            {ETAT_UNITE_LABELS[unite.etat]}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-medium text-foreground">{TYPE_UNITE_LABELS[unite.type]}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Surface</dt>
                        <dd className="font-medium text-foreground">{unite.surface} m²</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Pièces</dt>
                        <dd className="font-medium text-foreground">{unite.nombrePieces}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Loyer de base</dt>
                        <dd className="font-medium text-foreground">
                            {currencyFormatter.format(unite.loyerMensuel)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Charges ({TYPE_CHARGES_LABELS[unite.typeCharges]})</dt>
                        <dd className="font-medium text-foreground">
                            {unite.typeCharges === "POURCENTAGE"
                                ? `${unite.valeurCharges}%`
                                : currencyFormatter.format(unite.valeurCharges)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Caution</dt>
                        <dd className="font-medium text-foreground">
                            {currencyFormatter.format(unite.caution)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Fréquence de paiement</dt>
                        <dd className="font-medium text-foreground">{frequenceLabel}</dd>
                    </div>

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Meublée</dt>
                        <dd className="font-medium text-foreground">
                            {unite.isMeuble ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    Oui
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Non</span>
                            )}
                        </dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
