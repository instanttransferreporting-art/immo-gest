import { createContext } from "react";

type SidebarContextType = {
    collapsed: boolean;
    toggle: () => void;
};

export const SidebarContext =
    createContext<SidebarContextType | null>(null);