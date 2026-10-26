"use client";

import { usePathname } from "next/navigation";

import { useI18n } from "@/i18n/client";
import type { SidebarItemKey } from "@/components/layout/SidebarItem";

/** Segment d'URL → libellé de menu traduit. Un identifiant (uuid) devient « Détail ». */
const SEGMENT_KEYS: Readonly<Record<string, SidebarItemKey>> = {
    dashboard: "dashboard",
    properties: "properties",
    tenants: "tenants",
    leases: "leases",
    invoices: "invoices",
    payments: "payments",
    recouvrement: "collections",
    incidents: "incidents",
    reports: "reports",
    audit: "audit",
    settings: "settings",
    users: "users",
    platform: "platform",
    proprietaires: "owners",
    bilan: "ownerStatement",
};

export function Breadcrumb() {
    const pathname = usePathname();
    const { t } = useI18n();

    const segments = pathname.split("/").filter(Boolean);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {segments.map((segment, index) => {
                const key = SEGMENT_KEYS[segment];

                return (
                    <div key={`${segment}-${index}`} className="flex items-center gap-2">
                        {index > 0 && <span>/</span>}
                        <span className="first-letter:uppercase">{key ? t.layout.nav[key] : t.layout.nav.detail}</span>
                    </div>
                );
            })}
        </div>
    );
}
