"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogTable } from "@/features/audit/components/AuditLogTable";
import type { AuditLogDTO } from "@/features/audit/types/audit.types";

type AuditLogPanelProps = {
    entries: readonly AuditLogDTO[];
};

const ALL_VALUE = "TOUS";

export function AuditLogPanel({ entries }: AuditLogPanelProps) {
    const [userFilter, setUserFilter] = useState<string>(ALL_VALUE);
    const [actionFilter, setActionFilter] = useState<string>(ALL_VALUE);
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    const availableUsers = useMemo(() => {
        const unique = new Map<string, string>();
        for (const entry of entries) {
            unique.set(`${entry.user.prenom} ${entry.user.nom}`, `${entry.user.prenom} ${entry.user.nom}`);
        }
        return Array.from(unique.keys()).sort();
    }, [entries]);

    const availableActions = useMemo(() => {
        return Array.from(new Set(entries.map((entry) => entry.action))).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter((entry) => {
            const userLabel = `${entry.user.prenom} ${entry.user.nom}`;
            const matchesUser = userFilter === ALL_VALUE || userLabel === userFilter;
            const matchesAction = actionFilter === ALL_VALUE || entry.action === actionFilter;
            const matchesFrom = !dateFrom || entry.createdAt >= new Date(dateFrom);
            const matchesTo = !dateTo || entry.createdAt <= new Date(`${dateTo}T23:59:59`);

            return matchesUser && matchesAction && matchesFrom && matchesTo;
        });
    }, [entries, userFilter, actionFilter, dateFrom, dateTo]);

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="px-6">
                <CardTitle className="text-base font-semibold text-foreground">Journal d&apos;audit</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={userFilter}
                        onChange={(event) => setUserFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Tous les utilisateurs</option>
                        {availableUsers.map((user) => (
                            <option key={user} value={user}>
                                {user}
                            </option>
                        ))}
                    </select>

                    <select
                        value={actionFilter}
                        onChange={(event) => setActionFilter(event.target.value)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value={ALL_VALUE}>Toutes les actions</option>
                        {availableActions.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                        aria-label="Depuis le"
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    />

                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                        aria-label="Jusqu'au"
                        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                </div>

                <AuditLogTable entries={filteredEntries} />
            </CardContent>
        </Card>
    );
}
