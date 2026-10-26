import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { AuditLogPanel } from "@/features/audit/components/AuditLogPanel";
import { AuditQueryService } from "@/features/audit/services/audit-query.service";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.admin.audit.pageTitle} | ${t.common.appName}` };
}

export default async function AuditPage() {
    const { t } = await getI18n();

    const session = await getCurrentSession();
    const isAdmin = session?.user.role === RoleType.ADMIN || !!session?.user.impersonatedOrganizationId;

    if (!isAdmin) {
        redirect(ROUTES.DASHBOARD);
    }

    const entries = await AuditQueryService.list();

    return (
        <Container>
            <PageTitle
                title={t.admin.audit.pageTitle}
                description={t.admin.audit.description}
            />

            <div className="mt-6">
                <AuditLogPanel entries={entries} />
            </div>
        </Container>
    );
}
