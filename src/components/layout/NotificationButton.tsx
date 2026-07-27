"use client";

import { Bell } from "lucide-react";

type NotificationButtonProps = {
    count?: number;
};

export function NotificationButton({ count = 0 }: NotificationButtonProps) {
    return (
        <button
            type="button"
            aria-label="Notifications"
            className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition-all
                duration-200
                hover:bg-slate-50
                hover:text-slate-700
            "
        >
            <Bell className="h-5 w-5" />

            {count > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
        </button>
    );
}
