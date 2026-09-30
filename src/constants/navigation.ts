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
    Users,
    Wrench,
} from "lucide-react";

import { ROUTES } from "./routes";
import { SidebarNavigationItem } from "@/components/layout/SidebarItem";

export const SIDEBAR_NAVIGATION: SidebarNavigationItem[] = [
    {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Patrimoine",
        href: ROUTES.PROPERTIES,
        icon: Home,
    },
    {
        title: "Locataires",
        href: ROUTES.TENANTS,
        icon: Users,
    },
    {
        title: "Contrats",
        href: ROUTES.LEASES,
        icon: FileText,
    },
    {
        title: "Factures",
        href: ROUTES.INVOICES,
        icon: ReceiptText,
    },
    {
        title: "Paiements",
        href: ROUTES.PAYMENTS,
        icon: Receipt,
    },
    {
        title: "Recouvrement",
        href: ROUTES.RECOUVREMENT,
        icon: AlertTriangle,
    },
    {
        title: "Incidents",
        href: ROUTES.INCIDENTS,
        icon: Wrench,
    },
    {
        title: "Rapports",
        href: ROUTES.REPORTS,
        icon: BarChart3,
    },
    {
        title: "Journal d'audit",
        href: ROUTES.AUDIT,
        icon: History,
    },
    {
        title: "Paramètres",
        href: ROUTES.SETTINGS,
        icon: Settings,
    },
];