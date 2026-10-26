"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { StatutBail } from "@/generated/prisma/enums";
import type { LocataireContratDTO } from "@/features/tenants/types/tenant.types";
import { useI18n } from "@/i18n/client";

type LocataireContratsListProps = {
    contrats: readonly LocataireContratDTO[];
    maxVisible?: number;
};

const STATUT_BADGE_VARIANT: Record<StatutBail, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIF: "default",
    SUSPENDU: "secondary",
    RESILIE: "destructive",
    EXPIRE: "outline",
};

function ContratBadge({ contrat }: { contrat: LocataireContratDTO }) {
    const { t } = useI18n();

    return (
        <Link href={`${ROUTES.LEASES}/${contrat.id}`}>
            <Badge
                variant={STATUT_BADGE_VARIANT[contrat.statut]}
                className="rounded-lg font-mono hover:opacity-80"
                title={`${contrat.unite.immeuble.nom} — ${contrat.unite.numero} (${t.enums.statutBail[contrat.statut]})`}
            >
                {contrat.numeroContrat}
            </Badge>
        </Link>
    );
}

export function LocataireContratsList({ contrats, maxVisible = 2 }: LocataireContratsListProps) {
    const { t } = useI18n();

    if (contrats.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    // Priorité aux contrats actifs, puis ordre déjà fourni (plus récent d'abord).
    const sorted = [...contrats].sort((a, b) => {
        if (a.statut === StatutBail.ACTIF && b.statut !== StatutBail.ACTIF) return -1;
        if (a.statut !== StatutBail.ACTIF && b.statut === StatutBail.ACTIF) return 1;
        return 0;
    });

    const visible = sorted.slice(0, maxVisible);
    const hidden = sorted.slice(maxVisible);

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {visible.map((contrat) => (
                <ContratBadge key={contrat.id} contrat={contrat} />
            ))}

            {hidden.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button size="xs" variant="outline" className="rounded-lg" />}
                    >
                        <MoreHorizontal className="h-3.5 w-3.5" />+{hidden.length}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-64">
                        {hidden.map((contrat) => (
                            <DropdownMenuItem key={contrat.id} render={<Link href={`${ROUTES.LEASES}/${contrat.id}`} />}>
                                <span className="font-mono text-brand-700">{contrat.numeroContrat}</span>
                                <span className="text-muted-foreground">
                                    {contrat.unite.immeuble.nom} — {contrat.unite.numero}
                                </span>
                                <Badge variant={STATUT_BADGE_VARIANT[contrat.statut]} className="ml-auto rounded-lg text-xs">
                                    {t.enums.statutBail[contrat.statut]}
                                </Badge>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
