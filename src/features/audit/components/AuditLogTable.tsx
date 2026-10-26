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
import { useI18n } from "@/i18n/client";

type AuditLogTableProps = {
    entries: readonly AuditLogDTO[];
};


export function AuditLogTable({ entries }: AuditLogTableProps) {
    const { t, f } = useI18n();

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <History className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.admin.audit.empty}</p>
                <p className="text-sm text-muted-foreground">{t.admin.audit.emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>{t.common.date}</TableHead>
                        <TableHead>{t.admin.audit.user}</TableHead>
                        <TableHead>{t.admin.audit.action}</TableHead>
                        <TableHead>{t.admin.audit.details}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="text-muted-foreground">{f.dateTime(entry.createdAt)}</TableCell>
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
