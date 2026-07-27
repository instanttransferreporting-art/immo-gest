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
import { TypeLocataire } from "@/generated/prisma/enums";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

type LocatairesTableProps = {
    locataires: readonly LocataireDTO[];
};

export function LocatairesTable({ locataires }: LocatairesTableProps) {
    if (locataires.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Users className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucun locataire enregistré</p>
                <p className="text-sm text-slate-400">Ajoutez votre premier locataire pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Pièce d&apos;identité</TableHead>
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
                                <TableCell className="font-medium text-slate-900">
                                    {displayName}
                                    {!isPhysique && (
                                        <p className="text-xs font-normal text-slate-400">
                                            Représentant : {locataire.nom} {locataire.prenom}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={isPhysique ? "outline" : "secondary"} className="rounded-lg">
                                        {TYPE_LOCATAIRE_LABELS[locataire.type]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {isPhysique ? locataire.telephone : locataire.telephoneMoral ?? locataire.telephone}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {isPhysique ? locataire.email : locataire.emailMoral ?? locataire.email}
                                </TableCell>
                                <TableCell className="text-slate-600">{locataire.pieceIdentite}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
