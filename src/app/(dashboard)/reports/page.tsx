import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { RapportsPanel } from "@/features/reports/components/RapportsPanel";
import { ReportPeriodFilter } from "@/features/reports/components/ReportPeriodFilter";
import { formatPeriodLabel, parseReportPeriod, periodSearchParams } from "@/features/reports/period";
import { ReportService } from "@/features/reports/services/report.service";
import { getCurrentSession } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import type { RoleType } from "@/generated/prisma/enums";

export const metadata: Metadata = {
    title: "Rapports | Immo Gest",
};

type ReportsPageProps = {
    searchParams: Promise<{ du?: string | string[]; au?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string | null {
    return (Array.isArray(value) ? value[0] : value) ?? null;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const session = await getCurrentSession();
    const allowedRoles: readonly RoleType[] = PERMISSIONS.RAPPORTS_VIEW;
    const canView =
        !!session && (!!session.user.impersonatedOrganizationId || allowedRoles.includes(session.user.role));

    if (!canView) {
        redirect(ROUTES.DASHBOARD);
    }

    const { du, au } = await searchParams;
    const period = parseReportPeriod(firstValue(du), firstValue(au));

    const [summaries, performance] = await Promise.all([
        ReportService.getSummaries(period),
        ReportService.getPerformanceSummary(period),
    ]);

    return (
        <Container>
            <PageTitle title="Rapports" description="Rapports locatifs, financiers et de performance, exportables en Excel." />

            <div className="mt-6 space-y-6">
                <ReportPeriodFilter du={period.du} au={period.au} periodLabel={formatPeriodLabel(period)} />

                <RapportsPanel
                    summaries={summaries}
                    performance={performance}
                    periodQuery={periodSearchParams(period).toString()}
                />
            </div>
        </Container>
    );
}
