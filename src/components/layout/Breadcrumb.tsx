"use client";

import { usePathname } from "next/navigation";

export function Breadcrumb() {

    const pathname = usePathname();

    const segments = pathname
        .split("/")
        .filter(Boolean);

    return (

        <div className="flex items-center gap-2 text-sm text-slate-500">

            {segments.map((segment, index) => (

                <div
                    key={segment}
                    className="flex items-center gap-2"
                >
                    {index > 0 && (
                        <span>/</span>
                    )}

                    <span className="capitalize">
                        {segment}
                    </span>

                </div>

            ))}

        </div>

    );
}