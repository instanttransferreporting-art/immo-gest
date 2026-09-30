"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <button
                        type="button"
                        aria-label="Ouvrir le menu"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-border
                            bg-card
                            text-muted-foreground
                            shadow-sm
                            hover:bg-muted
                            lg:hidden
                        "
                    />
                }
            >
                <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 bg-card p-0">
                <Logo />

                <div className="flex-1 overflow-y-auto">
                    <Navigation onNavigate={() => setOpen(false)} />
                </div>

                <div className="border-t border-border p-4">
                    <p className="text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} ImmoGest
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
