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
import { ETAT_UNITE_LABELS, TYPE_UNITE_LABELS } from "@/features/units/constants/unit.constants";
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
    if (unites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-10 text-center">
                <DoorOpen className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucune unité enregistrée</p>
                <p className="text-sm text-slate-400">Ajoutez la première unité de cet immeuble.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Numéro</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Loyer</TableHead>
                        <TableHead>Charges</TableHead>
                        <TableHead>État</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {unites.map((unite) => (
                        <TableRow key={unite.id}>
                            <TableCell className="font-medium text-slate-900">{unite.numero}</TableCell>
                            <TableCell className="text-slate-600">{TYPE_UNITE_LABELS[unite.type]}</TableCell>
                            <TableCell className="text-slate-600">{unite.surface} m²</TableCell>
                            <TableCell className="text-slate-600">{currencyFormatter.format(unite.loyerMensuel)}</TableCell>
                            <TableCell className="text-slate-600">
                                {currencyFormatter.format(computeChargesAmount(unite))}
                            </TableCell>
                            <TableCell>
                                <Badge variant={ETAT_BADGE_VARIANT[unite.etat]} className="rounded-lg">
                                    {ETAT_UNITE_LABELS[unite.etat]}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
