"use client";

import { useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";

import { SIDEBAR_SECTIONS } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { SidebarItem } from "./SidebarItem";

type NavigationProps = {
    collapsed?: boolean;
    /** Barre latérale fixe : réduite aux icônes sous le breakpoint lg. */
    responsive?: boolean;
    onNavigate?: () => void;
};

/*
 * Groupes repliés, mémorisés dans le navigateur (préférence propre à chaque utilisateur).
 * useSyncExternalStore plutôt qu'un useEffect : le rendu serveur affiche tout déplié
 * (aucun écart d'hydratation), puis l'état mémorisé s'applique côté client.
 */
const STORAGE_KEY = "sidebar-collapsed-sections";
const CHANGE_EVENT = "sidebar-sections-change";

function readCollapsed(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(CHANGE_EVENT, callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(CHANGE_EVENT, callback);
    };
}

function toggleSection(title: string, collapsedTitles: string[]) {
    const next = collapsedTitles.includes(title)
        ? collapsedTitles.filter((item) => item !== title)
        : [...collapsedTitles, title];

    try {
        localStorage.setItem(STORAGE_KEY, next.join("|"));
    } catch {
        // Stockage indisponible (navigation privée…) : le repli ne sera simplement pas mémorisé.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function Navigation({
                               collapsed = false,
                               responsive = false,
                               onNavigate,
                           }: NavigationProps) {
    const { t } = useI18n();
    const stored = useSyncExternalStore(subscribe, readCollapsed, () => "");
    const collapsedTitles = stored ? stored.split("|") : [];

    return (
        <nav className="flex flex-col gap-3 px-3 py-4">
            {SIDEBAR_SECTIONS.map((section, index) => {
                const isClosed = !collapsed && collapsedTitles.includes(section.key);
                const contentId = `sidebar-section-${index}`;

                return (
                    <div key={section.key} className="flex flex-col">
                        {/* Titre de groupe cliquable ; en mode icônes seules, un simple séparateur le remplace. */}
                        {!collapsed && (
                            <button
                                type="button"
                                aria-expanded={!isClosed}
                                aria-controls={contentId}
                                onClick={() => toggleSection(section.key, collapsedTitles)}
                                className={cn(
                                    "group/section flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
                                    responsive && "hidden lg:flex"
                                )}
                            >
                                {t.layout.nav.sections[section.key]}
                                <ChevronDown
                                    className={cn(
                                        "h-3.5 w-3.5 transition-transform duration-200",
                                        isClosed && "-rotate-90"
                                    )}
                                />
                            </button>
                        )}
                        {index > 0 && (
                            <div
                                aria-hidden
                                className={cn(
                                    "mx-3 mb-2 border-t border-border",
                                    !collapsed && !responsive && "hidden",
                                    !collapsed && responsive && "lg:hidden"
                                )}
                            />
                        )}

                        {/* Animation de hauteur via grid-rows 1fr ↔ 0fr. En mode icônes (sous lg), toujours déplié. */}
                        <div
                            id={contentId}
                            className={cn(
                                "grid transition-[grid-template-rows] duration-200 ease-out",
                                !isClosed && "grid-rows-[1fr]",
                                isClosed && !responsive && "grid-rows-[0fr]",
                                isClosed && responsive && "grid-rows-[1fr] lg:grid-rows-[0fr]"
                            )}
                        >
                            <div className="flex min-h-0 flex-col gap-1 overflow-hidden pt-1">
                                {section.items.map((item) => (
                                    <SidebarItem
                                        key={item.href}
                                        item={item}
                                        collapsed={collapsed}
                                        responsive={responsive}
                                        onNavigate={onNavigate}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}
