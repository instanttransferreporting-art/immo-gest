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
import type { ContratDTO } from "@/features/leases/types/lease.types";
import { useI18n } from "@/i18n/client";

type ContratsTableProps = {
    contrats: readonly ContratDTO[];
};

const STATUT_BADGE_VARIANT: Record<ContratDTO["statut"], "default" | "secondary" | "destructive" | "outline"> = {
    ACTIF: "default",
    SUSPENDU: "secondary",
    RESILIE: "destructive",
    EXPIRE: "outline",
};

export function ContratsTable({ contrats }: ContratsTableProps) {
    const { t, f } = useI18n();

    if (contrats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.leases.empty}</p>
                <p className="text-sm text-muted-foreground">{t.leases.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.leases.number}</TableHead>
                        <TableHead>{t.leases.unit}</TableHead>
                        <TableHead>{t.leases.tenant}</TableHead>
                        <TableHead>{t.leases.period}</TableHead>
                        <TableHead>{t.leases.rent}</TableHead>
                        <TableHead>{t.leases.frequency}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {contrats.map((contrat) => (
                        <TableRow key={contrat.id}>
                            <TableCell>
                                <Link href={`${ROUTES.LEASES}/${contrat.id}`}>
                                    <Badge
                                        variant="outline"
                                        className="rounded-lg font-mono text-brand-700 hover:bg-brand-50"
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
                                {f.dateShort(contrat.dateDebut)} → {f.dateShort(contrat.dateFin)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{f.currency(contrat.loyerBase)}</TableCell>
                            <TableCell className="text-muted-foreground">{t.enums.frequenceEcheance[contrat.frequence]}</TableCell>
                            <TableCell>
                                <Badge variant={STATUT_BADGE_VARIANT[contrat.statut]} className="rounded-lg">
                                    {t.enums.statutBail[contrat.statut]}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
