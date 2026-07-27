"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type RoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "U";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserMenu() {
    const { data: session } = useSession();

    const displayName = session?.user?.name ?? "Utilisateur";
    const displayEmail = session?.user?.email ?? "";
    const roleLabel = session?.user?.role ? ROLE_LABELS[session.user.role as RoleType] : "";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                px-2.5
                py-2
                shadow-sm
                transition-colors
                duration-200
                hover:bg-slate-50
            "
            >
                <Avatar>
                    <AvatarFallback className="bg-emerald-600 font-semibold text-white">
                        {getInitials(displayName)}
                    </AvatarFallback>
                </Avatar>

                <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{roleLabel || displayEmail}</p>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal text-slate-500">
                        {displayEmail}
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
                >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
