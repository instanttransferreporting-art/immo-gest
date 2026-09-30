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
import { TYPE_LOCATAIRE_LABELS } from "@/features/tenants/constants/tenant.constants";
import { LocataireContratsList } from "@/features/tenants/components/LocataireContratsList";
import { TypeLocataire } from "@/generated/prisma/enums";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

type LocataireDetailModalProps = {
    locataire: LocataireDTO;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export function LocataireDetailModal({ locataire }: LocataireDetailModalProps) {
    const [open, setOpen] = useState(false);

    const isPhysique = locataire.type === TypeLocataire.PHYSIQUE;
    const displayName = isPhysique
        ? `${locataire.nom} ${locataire.prenom}`
        : locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`;

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
                        {displayName}
                        <Badge
                            variant={isPhysique ? "outline" : "secondary"}
                            className="rounded-lg text-xs"
                        >
                            {TYPE_LOCATAIRE_LABELS[locataire.type]}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">Contrat(s)</p>
                    <LocataireContratsList contrats={locataire.contrats} maxVisible={3} />
                </div>

                <dl className="space-y-3 text-sm">
                    {/* Informations personnelles */}
                    {!isPhysique && (
                        <div className="flex justify-between border-b border-border pb-2">
                            <dt className="text-muted-foreground">Raison sociale</dt>
                            <dd className="font-medium text-foreground">{locataire.raisonSociale ?? "—"}</dd>
                        </div>
                    )}

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">
                            {isPhysique ? "Nom complet" : "Représentant légal"}
                        </dt>
                        <dd className="font-medium text-foreground">
                            {locataire.nom} {locataire.prenom}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Téléphone</dt>
                        <dd className="font-medium text-foreground">
                            {isPhysique ? locataire.telephone : (locataire.telephoneMoral ?? locataire.telephone)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium text-foreground break-all">
                            {isPhysique ? locataire.email : (locataire.emailMoral ?? locataire.email)}
                        </dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Adresse</dt>
                        <dd className="text-right font-medium text-foreground">{locataire.adresse}</dd>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground">Pièce d&apos;identité</dt>
                        <dd className="font-medium text-foreground">{locataire.pieceIdentite}</dd>
                    </div>

                    {isPhysique && (
                        <>
                            {locataire.profession && (
                                <div className="flex justify-between border-b border-border pb-2">
                                    <dt className="text-muted-foreground">Profession</dt>
                                    <dd className="font-medium text-foreground">{locataire.profession}</dd>
                                </div>
                            )}

                            {locataire.revenuMensuelMoyen && (
                                <div className="flex justify-between border-b border-border pb-2">
                                    <dt className="text-muted-foreground">Revenu mensuel</dt>
                                    <dd className="font-medium text-foreground">
                                        {currencyFormatter.format(locataire.revenuMensuelMoyen)}
                                    </dd>
                                </div>
                            )}

                            {locataire.dateNaissance && (
                                <div className="flex justify-between border-b border-border pb-2">
                                    <dt className="text-muted-foreground">Date de naissance</dt>
                                    <dd className="font-medium text-foreground">
                                        {dateFormatter.format(new Date(locataire.dateNaissance))}
                                    </dd>
                                </div>
                            )}
                        </>
                    )}

                    {!isPhysique && (
                        <>
                            {locataire.rccm && (
                                <div className="flex justify-between border-b border-border pb-2">
                                    <dt className="text-muted-foreground">RCCM</dt>
                                    <dd className="font-medium text-foreground">{locataire.rccm}</dd>
                                </div>
                            )}

                            {locataire.niu && (
                                <div className="flex justify-between border-b border-border pb-2">
                                    <dt className="text-muted-foreground">NIU</dt>
                                    <dd className="font-medium text-foreground">{locataire.niu}</dd>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Enregistré le</dt>
                        <dd className="font-medium text-foreground">
                            {dateFormatter.format(new Date(locataire.createdAt))}
                        </dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}
