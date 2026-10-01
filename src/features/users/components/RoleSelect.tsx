import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/constants/roles";
import { ASSIGNABLE_ROLES } from "@/features/users/constants/user.constants";

type RoleSelectProps = ComponentProps<"select"> & {
    invalid?: boolean;
};

export function RoleSelect({ invalid, className, ...props }: RoleSelectProps) {
    return (
        <select
            className={cn(
                "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                invalid && "border-red-500",
                className
            )}
            {...props}
        >
            {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                </option>
            ))}
        </select>
    );
}
