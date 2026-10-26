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
import { UniteDetailModal } from "@/features/units/components/UniteDetailModal";
import { UniteEditModal } from "@/features/units/components/UniteEditModal";
import { FrequencePaiement } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";
import { useI18n } from "@/i18n/client";

type UnitesTableProps = {
    unites: readonly UniteDTO[];
};

const ETAT_BADGE_VARIANT: Record<UniteDTO["etat"], "default" | "secondary" | "outline"> = {
    LIBRE: "outline",
    OCCUPE: "default",
    RESERVE: "secondary",
};

export function UnitesTable({ unites }: UnitesTableProps) {
    const { t, f } = useI18n();

    const router = useRouter();

    if (unites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <DoorOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.units.empty}</p>
                <p className="text-sm text-muted-foreground">{t.units.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.units.number}</TableHead>
                        <TableHead>{t.common.type}</TableHead>
                        <TableHead>{t.units.surface}</TableHead>
                        <TableHead>{t.units.rent}</TableHead>
                        <TableHead>{t.units.charges}</TableHead>
                        <TableHead>{t.units.frequency}</TableHead>
                        <TableHead>{t.units.state}</TableHead>
                        <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {unites.map((unite) => {
                        const frequenceLabel =
                            unite.frequencePaiement === FrequencePaiement.AUTRE && unite.frequenceAutreTexte
                                ? unite.frequenceAutreTexte
                                : t.enums.frequencePaiement[unite.frequencePaiement];

                        return (
                            <TableRow key={unite.id}>
                                <TableCell className="font-medium text-foreground">
                                    <span className="flex items-center gap-1.5">
                                        {unite.numero}
                                        {unite.isMeuble && (
                                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                                                {t.units.furnished}
                                            </span>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{t.enums.typeUnite[unite.type]}</TableCell>
                                <TableCell className="text-muted-foreground">{unite.surface} m²</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {f.currency(unite.loyerMensuel)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {f.currency(computeChargesAmount(unite))}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">{frequenceLabel}</TableCell>
                                <TableCell>
                                    <Badge variant={ETAT_BADGE_VARIANT[unite.etat]} className="rounded-lg">
                                        {t.enums.etatUnite[unite.etat]}
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
