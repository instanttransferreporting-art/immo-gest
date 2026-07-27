"use client";

import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import {useSidebar} from "@/hooks/useSidebar";

export function Sidebar() {

    const { collapsed } =
        useSidebar();

    return (
        <aside
            className={[
                "hidden lg:flex",
                "fixed left-0 top-0 z-40",
                "h-screen",
                collapsed ? "w-20" : "w-72",
                "flex-col",
                "border-r",
                "border-slate-200",
                "bg-white",
                "transition-all duration-300",
            ].join(" ")}
        >
            <Logo collapsed={collapsed} />

            <div className="flex-1 overflow-y-auto">
                <Navigation collapsed={collapsed} />
            </div>

            <div className="border-t border-slate-200 p-4">
                {!collapsed && (
                    <p className="text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} ImmoGest
                    </p>
                )}
            </div>
        </aside>
    );
}