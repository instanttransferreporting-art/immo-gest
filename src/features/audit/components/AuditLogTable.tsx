import { History } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogDTO } from "@/features/audit/types/audit.types";

type AuditLogTableProps = {
    entries: readonly AuditLogDTO[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export function AuditLogTable({ entries }: AuditLogTableProps) {
    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <History className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Aucune entrée d&apos;audit</p>
                <p className="text-sm text-muted-foreground">Les actions sensibles apparaîtront ici au fur et à mesure.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Détails</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="text-muted-foreground">{dateFormatter.format(entry.createdAt)}</TableCell>
                            <TableCell className="font-medium text-foreground">
                                {entry.user.prenom} {entry.user.nom}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="rounded-lg font-mono text-xs">
                                    {entry.action}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{entry.details ?? "—"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
