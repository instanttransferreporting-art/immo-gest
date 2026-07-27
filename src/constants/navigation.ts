import {
    Building2,
    FileText,
    Home,
    LayoutDashboard,
    Receipt,
    ReceiptText,
    Settings,
    Users,
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
        title: "Entreprises",
        href: ROUTES.ORGANIZATIONS,
        icon: Building2,
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
        title: "Paramètres",
        href: ROUTES.SETTINGS,
        icon: Settings,
    },
];