import { SIDEBAR_NAVIGATION } from "@/constants/navigation";
import { SidebarItem } from "./SidebarItem";

type NavigationProps = {
    collapsed?: boolean;
    onNavigate?: () => void;
};

export function Navigation({
                               collapsed = false,
                               onNavigate,
                           }: NavigationProps) {
    return (
        <nav className="flex flex-col gap-1 px-3 py-4">
            {SIDEBAR_NAVIGATION.map((item) => (
                <SidebarItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            ))}
        </nav>
    );
}
