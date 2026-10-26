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
import { useI18n } from "@/i18n/client";

type ImmeublesTableProps = {
    immeubles: readonly ImmeubleDTO[];
    proprietaireOptions: readonly ProprietaireOptionDTO[];
};

export function ImmeublesTable({ immeubles, proprietaireOptions }: ImmeublesTableProps) {
    const { t, f } = useI18n();

    const router = useRouter();

    if (immeubles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.properties.buildings.empty}</p>
                <p className="text-sm text-muted-foreground">{t.properties.buildings.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.properties.buildings.reference}</TableHead>
                        <TableHead>{t.common.name}</TableHead>
                        <TableHead>{t.common.city}</TableHead>
                        <TableHead>{t.properties.buildings.owner}</TableHead>
                        <TableHead>{t.properties.buildings.estimatedValue}</TableHead>
                        <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {immeubles.map((immeuble) => (
                        <TableRow key={immeuble.id}>
                            <TableCell>
                                <Badge variant="outline" className="rounded-lg font-mono text-brand-700">
                                    {immeuble.reference}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                <Link
                                    href={`${ROUTES.PROPERTIES}/${immeuble.id}`}
                                    className="hover:text-brand-700 hover:underline"
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
                                    ? f.currency(immeuble.valeurEstimative)
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
