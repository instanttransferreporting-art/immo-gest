"use client";

import {
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

import { useSidebar } from "@/hooks/useSidebar";

export function SidebarToggle() {

    const {
        collapsed,
        toggle,
    } = useSidebar();

    return (

        <button
            onClick={toggle}
            className="
                rounded-lg
                border
                p-2
                hover:bg-slate-100
            "
        >

            {collapsed ? (
                <PanelLeftOpen size={20} />
            ) : (
                <PanelLeftClose size={20} />
            )}

        </button>

    );

}