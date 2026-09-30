"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TYPE_LOCATAIRE_LABELS } from "@/features/tenants/constants/tenant.constants";
import { LocataireDetailModal } from "@/features/tenants/components/LocataireDetailModal";
import { LocataireEditModal } from "@/features/tenants/components/LocataireEditModal";
import { TypeLocataire } from "@/generated/prisma/enums";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

type LocatairesTableProps = {
    locataires: readonly LocataireDTO[];
};

export function LocatairesTable({ locataires }: LocatairesTableProps) {
    const router = useRouter();

    if (locataires.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucun locataire enregistré</p>
                <p className="text-sm text-muted-foreground">Ajoutez votre premier locataire pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Pièce d&apos;identité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {locataires.map((locataire) => {
                        const isPhysique = locataire.type === TypeLocataire.PHYSIQUE;
                        const displayName = isPhysique
                            ? `${locataire.nom} ${locataire.prenom}`
                            : locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`;

                        return (
                            <TableRow key={locataire.id}>
                                <TableCell className="font-medium text-foreground">
                                    {displayName}
                                    {!isPhysique && (
                                        <p className="text-xs font-normal text-muted-foreground">
                                            Représentant : {locataire.nom} {locataire.prenom}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={isPhysique ? "outline" : "secondary"} className="rounded-lg">
                                        {TYPE_LOCATAIRE_LABELS[locataire.type]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {isPhysique ? locataire.telephone : locataire.telephoneMoral ?? locataire.telephone}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {isPhysique ? locataire.email : locataire.emailMoral ?? locataire.email}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{locataire.pieceIdentite}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <LocataireDetailModal locataire={locataire} />
                                        <LocataireEditModal
                                            locataire={locataire}
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
