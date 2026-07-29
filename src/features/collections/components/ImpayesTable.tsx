import { AlertTriangle } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STATUT_FACTURE_LABELS } from "@/features/invoices/constants/invoice.constants";
import { NIVEAU_RELANCE_LABELS } from "@/features/collections/constants/collection.constants";
import { RelanceActions } from "@/features/collections/components/RelanceActions";
import type { ImpayeDTO } from "@/features/collections/types/collection.types";
import type { StatutFacture } from "@/features/invoices/types/invoice.types";

type ImpayesTableProps = {
    impayes: readonly ImpayeDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const STATUT_BADGE_VARIANT: Record<StatutFacture, "default" | "secondary" | "outline"> = {
    EN_ATTENTE: "outline",
    PAYEE: "default",
    PARTIEL: "secondary",
};

export function ImpayesTable({ impayes }: ImpayesTableProps) {
    if (impayes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucun impayé</p>
                <p className="text-sm text-slate-400">Toutes les factures échues sont réglées.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Jours de retard</TableHead>
                        <TableHead>Solde restant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Dernier niveau</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {impayes.map((impaye) => (
                        <TableRow key={impaye.id}>
                            <TableCell>
                                <Badge variant="outline" className="rounded-lg font-mono text-emerald-700">
                                    {impaye.numero}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                                {impaye.contrat.locataire.raisonSociale ??
                                    `${impaye.contrat.locataire.nom} ${impaye.contrat.locataire.prenom}`}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {impaye.contrat.unite.immeuble.nom} — {impaye.contrat.unite.numero}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={
                                        impaye.joursRetard > 30
                                            ? "rounded-lg bg-red-50 text-red-700"
                                            : "rounded-lg bg-amber-50 text-amber-700"
                                    }
                                >
                                    {impaye.joursRetard} j
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {currencyFormatter.format(impaye.soldeRestant)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[impaye.statut]} className="rounded-lg">
                                    {STATUT_FACTURE_LABELS[impaye.statut]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {impaye.dernierNiveauRelance
                                    ? NIVEAU_RELANCE_LABELS[impaye.dernierNiveauRelance]
                                    : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                                <RelanceActions
                                    echeanceId={impaye.echeanceId}
                                    dernierNiveauRelance={impaye.dernierNiveauRelance}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
