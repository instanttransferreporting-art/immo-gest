"use client";

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
import type { ImmeubleDTO } from "@/features/properties/types/property.types";
import { useState } from "react";

type ImmeubleDetailModalProps = {
    immeuble: ImmeubleDTO;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export function ImmeubleDetailModal({ immeuble }: ImmeubleDetailModalProps) {
    const [open, setOpen] = useState(false);

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
                        {immeuble.nom}
                        <Badge variant="outline" className="rounded-lg font-mono text-emerald-700">
                            {immeuble.reference}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Propriétaire</dt>
                        <dd className="font-medium text-foreground">
                            {`${immeuble.proprietaire.nom} ${immeuble.proprietaire.prenom ?? ""}`.trim()}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Adresse</dt>
                        <dd className="text-right font-medium text-foreground">
                            {immeuble.adresse}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Ville</dt>
                        <dd className="font-medium text-foreground">{immeuble.ville}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Niveaux</dt>
                        <dd className="font-medium text-foreground">{immeuble.nombreNiveaux}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Logements</dt>
                        <dd className="font-medium text-foreground">{immeuble.nombreLogements}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Valeur estimative</dt>
                        <dd className="font-medium text-foreground">
                            {immeuble.valeurEstimative != null
                                ? currencyFormatter.format(immeuble.valeurEstimative)
                                : "—"}
                        </dd>
                    </div>

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Enregistré le</dt>
                        <dd className="font-medium text-foreground">
                            {dateFormatter.format(new Date(immeuble.createdAt))}
                        </dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
