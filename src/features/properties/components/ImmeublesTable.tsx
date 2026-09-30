"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ImmeubleDetailModal } from "@/features/properties/components/ImmeubleDetailModal";
import { ImmeubleEditModal } from "@/features/properties/components/ImmeubleEditModal";
import type { ImmeubleDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";

type ImmeublesTableProps = {
    immeubles: readonly ImmeubleDTO[];
    proprietaireOptions: readonly ProprietaireOptionDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export function ImmeublesTable({ immeubles, proprietaireOptions }: ImmeublesTableProps) {
    const router = useRouter();

    if (immeubles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucun immeuble enregistré</p>
                <p className="text-sm text-muted-foreground">Ajoutez votre premier immeuble pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Référence</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Propriétaire</TableHead>
                        <TableHead>Valeur estimative</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell className="font-medium text-foreground">
                                <Link
                                    href={`${ROUTES.PROPERTIES}/${immeuble.id}`}
                                    className="hover:text-emerald-700 hover:underline"
                                >
                                    {immeuble.nom}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{immeuble.ville}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {`${immeuble.proprietaire.nom} ${immeuble.proprietaire.prenom ?? ""}`.trim()}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {immeuble.valeurEstimative != null
                                    ? currencyFormatter.format(immeuble.valeurEstimative)
                                    : "—"}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    <ImmeubleDetailModal immeuble={immeuble} />
                                    <ImmeubleEditModal
                                        immeuble={immeuble}
                                        proprietaireOptions={proprietaireOptions}
                                        onSuccess={() => router.refresh()}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
