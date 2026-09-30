import Link from "next/link";
import { FileText } from "lucide-react";

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
import { FREQUENCE_LABELS, STATUT_BAIL_LABELS } from "@/features/leases/constants/lease.constants";
import type { ContratDTO } from "@/features/leases/types/lease.types";

type ContratsTableProps = {
    contrats: readonly ContratDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR");

const STATUT_BADGE_VARIANT: Record<ContratDTO["statut"], "default" | "secondary" | "destructive" | "outline"> = {
    ACTIF: "default",
    SUSPENDU: "secondary",
    RESILIE: "destructive",
    EXPIRE: "outline",
};

export function ContratsTable({ contrats }: ContratsTableProps) {
    if (contrats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucun contrat enregistré</p>
                <p className="text-sm text-muted-foreground">Créez votre premier contrat de bail pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>N° Contrat</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Loyer</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {contrats.map((contrat) => (
                        <TableRow key={contrat.id}>
                            <TableCell>
                                <Link href={`${ROUTES.LEASES}/${contrat.id}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-emerald-700 hover:bg-emerald-50"
                                    >
                                        {contrat.numeroContrat}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {contrat.unite.immeuble.nom} — {contrat.unite.numero}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {dateFormatter.format(contrat.dateDebut)} → {dateFormatter.format(contrat.dateFin)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{currencyFormatter.format(contrat.loyerBase)}</TableCell>
                            <TableCell className="text-muted-foreground">{FREQUENCE_LABELS[contrat.frequence]}</TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[contrat.statut]} className="rounded-lg">
                                    {STATUT_BAIL_LABELS[contrat.statut]}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
