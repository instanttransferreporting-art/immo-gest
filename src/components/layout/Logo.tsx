import Link from "next/link";
import { Building2 } from "lucide-react";

import { ROUTES } from "@/constants/routes";

type LogoProps = {
    collapsed?: boolean;
};

export function Logo({ collapsed = false }: LogoProps) {
    return (
        <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-3 px-4 py-5 transition-colors hover:bg-slate-100"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Building2 className="h-6 w-6" />
            </div>

            {!collapsed && (
                <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">
            ImmoGest
          </span>

                    <span className="text-xs text-slate-500">
            Property Management
          </span>
                </div>
            )}
        </Link>
    );
}