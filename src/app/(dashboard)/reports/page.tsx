import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { RapportsPanel } from "@/features/reports/components/RapportsPanel";
import { ReportService } from "@/features/reports/services/report.service";
import { getCurrentSession } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import type { RoleType } from "@/generated/prisma/enums";

export const metadata: Metadata = {
    title: "Rapports | Immo Gest",
};

export default async function ReportsPage() {
    const session = await getCurrentSession();
    const allowedRoles: readonly RoleType[] = PERMISSIONS.RAPPORTS_VIEW;
    const canView =
        !!session && (!!session.user.impersonatedOrganizationId || allowedRoles.includes(session.user.role));

    if (!canView) {
        redirect(ROUTES.DASHBOARD);
    }

    const [summaries, performance] = await Promise.all([
        ReportService.getSummaries(),
        ReportService.getPerformanceSummary(),
    ]);

    return (
        <Container>
            <PageTitle title="Rapports" description="Rapports locatifs, financiers et de performance, exportables en Excel." />

            <div className="mt-6">
                <RapportsPanel summaries={summaries} performance={performance} />
            </div>
        </Container>
    );
}
