"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarNavigationItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

type SidebarItemProps = {
    item: SidebarNavigationItem;
    collapsed?: boolean;
    responsive?: boolean;
    onNavigate?: () => void;
};

export function SidebarItem({
                                item,
                                collapsed = false,
                                responsive = false,
                                onNavigate,
                            }: SidebarItemProps) {
    const pathname = usePathname();

    const active =
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`);

    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed || responsive ? item.title : undefined}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center",
                responsive && !collapsed && "justify-center lg:justify-start",

                active
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon
                className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active
                        ? "text-brand-600"
                        : "text-muted-foreground group-hover:text-foreground"
                )}
            />

            {!collapsed && (
                <span className={cn("truncate", responsive && "hidden lg:inline")}>{item.title}</span>
            )}
        </Link>
    );
}