"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";

/** Clés des libellés de menu (`t.layout.nav[...]`), hors entrées non textuelles. */
export type SidebarItemKey = {
    [K in keyof Messages["layout"]["nav"]]: Messages["layout"]["nav"][K] extends string ? K : never;
}[keyof Messages["layout"]["nav"]];

export type SidebarNavigationItem = {
    key: SidebarItemKey;
    href: string;
    icon: LucideIcon;
};

type SidebarItemProps = {
    item: SidebarNavigationItem;
    collapsed?: boolean;
    responsive?: boolean;
    onNavigate?: () => void;
};

/** Icône du lien ; remplacée par un spinner pendant la navigation vers ce lien (doit être sous <Link>). */
function ItemIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
    const { pending } = useLinkStatus();

    if (pending) {
        return <Loader2 aria-hidden className="h-5 w-5 flex-shrink-0 animate-spin text-brand-600" />;
    }

    return (
        <Icon
            className={cn(
                "h-5 w-5 flex-shrink-0",
                active ? "text-brand-600" : "text-muted-foreground group-hover:text-foreground"
            )}
        />
    );
}

export function SidebarItem({
                                item,
                                collapsed = false,
                                responsive = false,
                                onNavigate,
                            }: SidebarItemProps) {
    const pathname = usePathname();
    const { t } = useI18n();
    const title = t.layout.nav[item.key];

    const active =
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`);

    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed || responsive ? title : undefined}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center",
                responsive && !collapsed && "justify-center lg:justify-start",

                active
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <ItemIcon icon={Icon} active={active} />

            {!collapsed && (
                <span className={cn("truncate", responsive && "hidden lg:inline")}>{title}</span>
            )}
        </Link>
    );
}