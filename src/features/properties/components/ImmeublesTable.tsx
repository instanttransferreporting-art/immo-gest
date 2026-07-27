import Link from "next/link";
import { Building2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import type { ImmeubleDTO } from "@/features/properties/types/property.types";

type ImmeublesTableProps = {
    immeubles: readonly ImmeubleDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export function ImmeublesTable({ immeubles }: ImmeublesTableProps) {
    if (immeubles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Building2 className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucun immeuble enregistré</p>
                <p className="text-sm text-slate-400">Ajoutez votre premier immeuble pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Référence</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Propriétaire</TableHead>
                        <TableHead>Logements</TableHead>
                        <TableHead>Valeur estimative</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {immeubles.map((immeuble) => (
                        <TableRow key={immeuble.id}>
                            <TableCell>
                                <Badge variant="outline" className="rounded-lg font-mono text-emerald-700">
                                    {immeuble.reference}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                                <Link
                                    href={`${ROUTES.PROPERTIES}/${immeuble.id}`}
                                    className="hover:text-emerald-700 hover:underline"
                                >
                                    {immeuble.nom}
                                </Link>
                            </TableCell>
                            <TableCell className="text-slate-600">{immeuble.ville}</TableCell>
                            <TableCell className="text-slate-600">
                                {`${immeuble.proprietaire.nom} ${immeuble.proprietaire.prenom ?? ""}`.trim()}
                            </TableCell>
                            <TableCell className="text-slate-600">{immeuble.nombreLogements}</TableCell>
                            <TableCell className="text-slate-600">
                                {immeuble.valeurEstimative != null
                                    ? currencyFormatter.format(immeuble.valeurEstimative)
                                    : "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
