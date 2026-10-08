"use client";

import { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarProvider";
import { useSidebar } from "@/hooks/useSidebar";
import { ImpersonationBanner } from "@/features/platform/components/ImpersonationBanner";

function ShellContent({
                          children,
                      }: {
    children: ReactNode;
}) {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-background">
            <div className="print:hidden">
                <Sidebar />
            </div>

            <div
                className={
                    collapsed
                        ? "transition-all duration-300 lg:ml-20 print:ml-0"
                        : "transition-all duration-300 lg:ml-72 print:ml-0"
                }
            >
                {/* Le sticky doit être sur ce wrapper : le parent direct du header n'a que sa hauteur. */}
                <div className="sticky top-0 z-30 print:hidden">
                    <ImpersonationBanner />
                    <Header />
                </div>

                <main>{children}</main>
            </div>
        </div>
    );
}

export function AppShell({
                             children,
                         }: {
    children: ReactNode;
}) {
    return (
        <SidebarProvider>
            <ShellContent>{children}</ShellContent>
        </SidebarProvider>
    );
}