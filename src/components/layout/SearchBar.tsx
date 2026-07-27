"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
    placeholder?: string;
    className?: string;
};

export function SearchBar({
    placeholder = "Rechercher un bien, un locataire...",
    className,
}: SearchBarProps) {
    return (
        <div className={cn("relative hidden w-full max-w-sm md:block", className)}>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
                type="search"
                placeholder={placeholder}
                className="h-10 rounded-full border-slate-200 bg-slate-50 pl-9 focus-visible:bg-white"
            />
        </div>
    );
}
