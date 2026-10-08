"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchGlobal } from "@/features/search/actions/search.actions";
import type { SearchResultDTO, SearchResultGroup } from "@/features/search/types/search.types";

type SearchBarProps = {
    placeholder?: string;
    className?: string;
};

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

const GROUP_LABELS: Readonly<Record<SearchResultGroup, string>> = {
    IMMEUBLE: "Immeubles",
    UNITE: "Unités",
    LOCATAIRE: "Locataires",
    CONTRAT: "Contrats",
    PROPRIETAIRE: "Propriétaires",
};

export function SearchBar({
    placeholder = "Rechercher un bien, un locataire...",
    className,
}: SearchBarProps) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<readonly SearchResultDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const trimmed = query.trim();
    const canSearch = trimmed.length >= MIN_LENGTH;

    useEffect(() => {
        if (!canSearch) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            const response = await searchGlobal(trimmed);

            if (cancelled) {
                return;
            }

            setResults(response.success ? (response.data ?? []) : []);
            setActiveIndex(-1);
            setLoading(false);
        }, DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [trimmed, canSearch]);

    // Fermeture au clic extérieur
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function go(result: SearchResultDTO) {
        setOpen(false);
        setQuery("");
        setResults([]);
        router.push(result.href);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            setOpen(false);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter") {
            const target = results[activeIndex] ?? results[0];

            if (target) {
                event.preventDefault();
                go(target);
            }
        }
    }

    const showPanel = open && canSearch;
    const visibleResults = canSearch ? results : [];

    return (
        <div ref={containerRef} className={cn("relative hidden w-full max-w-sm md:block", className)}>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                type="search"
                value={query}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                className="h-10 rounded-full border-border bg-muted pl-9 focus-visible:bg-background"
            />

            {loading && canSearch && (
                <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}

            {showPanel && (
                <div className="absolute top-12 left-0 z-50 max-h-96 w-[28rem] max-w-[90vw] overflow-y-auto rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-lg">
                    {visibleResults.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                            {loading ? "Recherche..." : "Aucun résultat."}
                        </p>
                    ) : (
                        (Object.keys(GROUP_LABELS) as SearchResultGroup[]).map((group) => {
                            const items = visibleResults.filter((result) => result.group === group);

                            if (items.length === 0) {
                                return null;
                            }

                            return (
                                <div key={group} className="py-1">
                                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {GROUP_LABELS[group]}
                                    </p>

                                    {items.map((item) => {
                                        const isActive = visibleResults[activeIndex] === item;

                                        return (
                                            <button
                                                key={`${group}-${item.id}`}
                                                type="button"
                                                onClick={() => go(item)}
                                                onMouseEnter={() => setActiveIndex(visibleResults.indexOf(item))}
                                                className={cn(
                                                    "flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm",
                                                    isActive ? "bg-muted" : "hover:bg-muted"
                                                )}
                                            >
                                                <span className="truncate font-medium">{item.title}</span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {item.subtitle}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
