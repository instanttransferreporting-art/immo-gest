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
import type { FactureDTO, StatutFacture } from "@/features/invoices/types/invoice.types";
import { useI18n } from "@/i18n/client";

type FacturesTableProps = {
    factures: readonly FactureDTO[];
};

const STATUT_BADGE_VARIANT: Record<StatutFacture, "default" | "secondary" | "outline"> = {
    EN_ATTENTE: "outline",
    PAYEE: "default",
    PARTIEL: "secondary",
};

export function FacturesTable({ factures }: FacturesTableProps) {
    const { t, f } = useI18n();

    if (factures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.invoices.empty}</p>
                <p className="text-sm text-muted-foreground">{t.invoices.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.invoices.number}</TableHead>
                        <TableHead>{t.invoices.lease}</TableHead>
                        <TableHead>{t.invoices.tenant}</TableHead>
                        <TableHead>{t.invoices.period}</TableHead>
                        <TableHead>{t.invoices.totalAmount}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                        <TableHead>{t.invoices.email}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {factures.map((facture) => (
                        <TableRow key={facture.id}>
                            <TableCell>
                                <Link href={`${ROUTES.INVOICES}/${facture.id}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-brand-700 hover:bg-brand-50"
                                    >
                                        {facture.numero}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {facture.contrat.unite.immeuble.nom} — {facture.contrat.unite.numero}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {facture.contrat.locataire.raisonSociale ??
                                    `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {f.monthYear(facture.mois, facture.annee)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {f.currency(facture.totalDu)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[facture.statut]} className="rounded-lg">
                                    {t.enums.statutFacture[facture.statut]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {facture.avisEnvoye ? (
                                    <Badge
                                        className="rounded-lg bg-brand-50 text-brand-700"
                                        title={facture.avisEnvoyeAt ? f.date(facture.avisEnvoyeAt) : undefined}
                                    >
                                        <MailCheck className="h-3.5 w-3.5" />
                                        {t.invoices.noticeSent}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-lg text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        {t.invoices.noticeNotSent}
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
