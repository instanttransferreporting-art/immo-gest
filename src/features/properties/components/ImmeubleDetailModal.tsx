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
import { useI18n } from "@/i18n/client";

type ImmeubleDetailModalProps = {
    immeuble: ImmeubleDTO;
};

export function ImmeubleDetailModal({ immeuble }: ImmeubleDetailModalProps) {
    const { t, f } = useI18n();

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
                {t.properties.buildings.detail}
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {immeuble.nom}
                        <Badge variant="outline" className="rounded-lg font-mono text-brand-700">
                            {immeuble.reference}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.properties.buildings.owner}</dt>
                        <dd className="font-medium text-foreground">
                            {`${immeuble.proprietaire.nom} ${immeuble.proprietaire.prenom ?? ""}`.trim()}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.common.address}</dt>
                        <dd className="text-right font-medium text-foreground">
                            {immeuble.adresse}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.common.city}</dt>
                        <dd className="font-medium text-foreground">{immeuble.ville}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.properties.buildings.levels}</dt>
                        <dd className="font-medium text-foreground">{immeuble.nombreNiveaux}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">{t.properties.buildings.estimatedValue}</dt>
                        <dd className="font-medium text-foreground">
                            {immeuble.valeurEstimative != null
                                ? f.currency(immeuble.valeurEstimative)
                                : "—"}
                        </dd>
                    </div>

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">{t.properties.buildings.registeredOn}</dt>
                        <dd className="font-medium text-foreground">
                            {f.dateLong(immeuble.createdAt)}
                        </dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
