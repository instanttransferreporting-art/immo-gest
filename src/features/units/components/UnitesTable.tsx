"use client";

import { useRouter } from "next/navigation";
import { DoorOpen } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { computeChargesAmount } from "@/features/units/services/charges.calculator";
import { ETAT_UNITE_LABELS, FREQUENCE_PAIEMENT_LABELS, TYPE_UNITE_LABELS } from "@/features/units/constants/unit.constants";
import { UniteDetailModal } from "@/features/units/components/UniteDetailModal";
import { UniteEditModal } from "@/features/units/components/UniteEditModal";
import { FrequencePaiement } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";

type UnitesTableProps = {
    unites: readonly UniteDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const ETAT_BADGE_VARIANT: Record<UniteDTO["etat"], "default" | "secondary" | "outline"> = {
    LIBRE: "outline",
    OCCUPE: "default",
    RESERVE: "secondary",
};

export function UnitesTable({ unites }: UnitesTableProps) {
    const router = useRouter();

    if (unites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <DoorOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucune unité enregistrée</p>
                <p className="text-sm text-muted-foreground">Ajoutez la première unité de cet immeuble.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Numéro</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Loyer</TableHead>
                        <TableHead>Charges</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>État</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {unites.map((unite) => {
                        const frequenceLabel =
                            unite.frequencePaiement === FrequencePaiement.AUTRE && unite.frequenceAutreTexte
                                ? unite.frequenceAutreTexte
                                : FREQUENCE_PAIEMENT_LABELS[unite.frequencePaiement];

                        return (
                            <TableRow key={unite.id}>
                                <TableCell className="font-medium text-foreground">
                                    <span className="flex items-center gap-1.5">
                                        {unite.numero}
                                        {unite.isMeuble && (
                                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                                                Meublé
                                            </span>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{TYPE_UNITE_LABELS[unite.type]}</TableCell>
                                <TableCell className="text-muted-foreground">{unite.surface} m²</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {currencyFormatter.format(unite.loyerMensuel)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {currencyFormatter.format(computeChargesAmount(unite))}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">{frequenceLabel}</TableCell>
                                <TableCell>
                                    <Badge variant={ETAT_BADGE_VARIANT[unite.etat]} className="rounded-lg">
                                        {ETAT_UNITE_LABELS[unite.etat]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <UniteDetailModal unite={unite} />
                                        <UniteEditModal
                                            unite={unite}
                                            onSuccess={() => router.refresh()}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
