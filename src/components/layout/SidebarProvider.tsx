"use client";

import {
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

import { SidebarContext } from "./SidebarContext";

type Props = {
    children: ReactNode;
};

export function SidebarProvider({
                                    children,
                                }: Props) {

    const [collapsed, setCollapsed] =
        useState(false);

    useEffect(() => {

        const value =
            localStorage.getItem("sidebar");

        if (value) {

            setCollapsed(value === "true");

        }

    }, []);

    function toggle() {

        const next = !collapsed;

        setCollapsed(next);

        localStorage.setItem(
            "sidebar",
            String(next)
        );

    }

    const value = useMemo(
        () => ({
            collapsed,
            toggle,
        }),
        [collapsed]
    );

    return (

        <SidebarContext.Provider value={value}>

            {children}

        </SidebarContext.Provider>

    );

}