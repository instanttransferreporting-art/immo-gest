"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-border
                bg-card
                text-muted-foreground
                shadow-sm
                transition-all
                duration-200
                hover:bg-muted
                hover:text-foreground
            "
        >
            {mounted && isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
    );
}
