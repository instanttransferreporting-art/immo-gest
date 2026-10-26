"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    endOfMonth,
    endOfQuarter,
    endOfYear,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    subMonths,
    subYears,
} from "date-fns";
import { CalendarRange, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toDateInput } from "@/features/reports/period";

type ReportPeriodFilterProps = {
    du: string | null;
    au: string | null;
    periodLabel: string;
};

type Preset = { label: string; range: () => { du: string | null; au: string | null } };

function range(start: Date, end: Date) {
    return { du: toDateInput(start), au: toDateInput(end) };
}

const PRESETS: Preset[] = [
    { label: "Ce mois", range: () => range(startOfMonth(new Date()), endOfMonth(new Date())) },
    {
        label: "Mois dernier",
        range: () => {
            const lastMonth = subMonths(new Date(), 1);
            return range(startOfMonth(lastMonth), endOfMonth(lastMonth));
        },
    },
    { label: "Ce trimestre", range: () => range(startOfQuarter(new Date()), endOfQuarter(new Date())) },
    { label: "Cette année", range: () => range(startOfYear(new Date()), endOfYear(new Date())) },
    {
        label: "Année dernière",
        range: () => {
            const lastYear = subYears(new Date(), 1);
            return range(startOfYear(lastYear), endOfYear(lastYear));
        },
    },
    { label: "Tout", range: () => ({ du: null, au: null }) },
];

export function ReportPeriodFilter({ du, au, periodLabel }: ReportPeriodFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [draftDu, setDraftDu] = useState(du ?? "");
    const [draftAu, setDraftAu] = useState(au ?? "");

    function apply(next: { du: string | null; au: string | null }) {
        setDraftDu(next.du ?? "");
        setDraftAu(next.au ?? "");

        const params = new URLSearchParams();

        if (next.du) {
            params.set("du", next.du);
        }

        if (next.au) {
            params.set("au", next.au);
        }

        const query = params.toString();
        startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
    }

    function isActive(preset: Preset) {
        const value = preset.range();
        return value.du === du && value.au === au;
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="space-y-4 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-brand-600" />
                        <p className="text-sm font-semibold text-foreground">Période analysée</p>
                        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground first-letter:uppercase">{periodLabel}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                        <Button
                            key={preset.label}
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => apply(preset.range())}
                            className={cn(
                                "rounded-lg",
                                isActive(preset) && "border-brand-600 bg-brand-50 text-brand-700"
                            )}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>

                <form
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        apply({ du: draftDu || null, au: draftAu || null });
                    }}
                >
                    <div className="space-y-1.5">
                        <label htmlFor="report-du" className="text-sm font-medium text-foreground">
                            Du
                        </label>
                        <Input
                            id="report-du"
                            type="date"
                            value={draftDu}
                            max={draftAu || undefined}
                            onChange={(event) => setDraftDu(event.target.value)}
                            className="h-10 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="report-au" className="text-sm font-medium text-foreground">
                            Au
                        </label>
                        <Input
                            id="report-au"
                            type="date"
                            value={draftAu}
                            min={draftDu || undefined}
                            onChange={(event) => setDraftAu(event.target.value)}
                            className="h-10 rounded-xl"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-10 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                    >
                        Appliquer
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
