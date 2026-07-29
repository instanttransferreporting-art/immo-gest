import Link from "next/link";
import { Mail, MailCheck, Receipt } from "lucide-react";

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
import { MOIS_LABELS, STATUT_FACTURE_LABELS } from "@/features/invoices/constants/invoice.constants";
import type { FactureDTO, StatutFacture } from "@/features/invoices/types/invoice.types";

type FacturesTableProps = {
    factures: readonly FactureDTO[];
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

const STATUT_BADGE_VARIANT: Record<StatutFacture, "default" | "secondary" | "outline"> = {
    EN_ATTENTE: "outline",
    PAYEE: "default",
    PARTIEL: "secondary",
};

export function FacturesTable({ factures }: FacturesTableProps) {
    if (factures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Receipt className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Aucune facture</p>
                <p className="text-sm text-slate-400">Générez les factures du mois pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Contrat</TableHead>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Montant total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {factures.map((facture) => (
                        <TableRow key={facture.id}>
                            <TableCell>
                                <Link href={`${ROUTES.INVOICES}/${facture.id}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-emerald-700 hover:bg-emerald-50"
                                    >
                                        {facture.numero}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {facture.contrat.unite.immeuble.nom} — {facture.contrat.unite.numero}
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                                {facture.contrat.locataire.raisonSociale ??
                                    `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {MOIS_LABELS[facture.mois - 1]} {facture.annee}
                            </TableCell>
                            <TableCell className="text-slate-600">
                                {currencyFormatter.format(facture.totalDu)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[facture.statut]} className="rounded-lg">
                                    {STATUT_FACTURE_LABELS[facture.statut]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {facture.avisEnvoye ? (
                                    <Badge
                                        className="rounded-lg bg-emerald-50 text-emerald-700"
                                        title={facture.avisEnvoyeAt ? dateFormatter.format(facture.avisEnvoyeAt) : undefined}
                                    >
                                        <MailCheck className="h-3.5 w-3.5" />
                                        Avis envoyé
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-lg text-slate-500">
                                        <Mail className="h-3.5 w-3.5" />
                                        Non envoyé
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
