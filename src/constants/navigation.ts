import {
    AlertTriangle,
    BarChart3,
    FileText,
    History,
    Home,
    LayoutDashboard,
    Receipt,
    ReceiptText,
    Settings,
    UserCog,
    Users,
    Wrench,
} from "lucide-react";

import { ROUTES } from "./routes";
import type { SidebarNavigationItem } from "@/components/layout/SidebarItem";
import type { Messages } from "@/i18n/messages";

export type SidebarSectionKey = keyof Messages["layout"]["nav"]["sections"];

export type SidebarNavigationSection = {
    /** Clé de traduction du titre du groupe (`t.layout.nav.sections[...]`). */
    key: SidebarSectionKey;
    items: SidebarNavigationItem[];
};

/** Menu latéral, regroupé par domaine métier. Les libellés sont traduits à l'affichage. */
export const SIDEBAR_SECTIONS: SidebarNavigationSection[] = [
    {
        key: "pilotage",
        items: [
            { key: "dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
            { key: "reports", href: ROUTES.REPORTS, icon: BarChart3 },
        ],
    },
    {
        key: "gestionLocative",
        items: [
            { key: "properties", href: ROUTES.PROPERTIES, icon: Home },
            { key: "tenants", href: ROUTES.TENANTS, icon: Users },
            { key: "leases", href: ROUTES.LEASES, icon: FileText },
            { key: "incidents", href: ROUTES.INCIDENTS, icon: Wrench },
        ],
    },
    {
        key: "finances",
        items: [
            { key: "invoices", href: ROUTES.INVOICES, icon: ReceiptText },
            { key: "payments", href: ROUTES.PAYMENTS, icon: Receipt },
            { key: "collections", href: ROUTES.RECOUVREMENT, icon: AlertTriangle },
        ],
    },
    {
        key: "administration",
        items: [
            { key: "users", href: ROUTES.USERS, icon: UserCog },
            { key: "audit", href: ROUTES.AUDIT, icon: History },
            { key: "settings", href: ROUTES.SETTINGS, icon: Settings },
        ],
    },
];
