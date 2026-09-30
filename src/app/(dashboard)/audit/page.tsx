import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { AuditLogPanel } from "@/features/audit/components/AuditLogPanel";
import { AuditQueryService } from "@/features/audit/services/audit-query.service";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
    title: "Journal d'audit | Immo Gest",
};

export default async function AuditPage() {
    const session = await getCurrentSession();
    const isAdmin = session?.user.role === RoleType.ADMIN || !!session?.user.impersonatedOrganizationId;

    if (!isAdmin) {
        redirect(ROUTES.DASHBOARD);
    }

    const entries = await AuditQueryService.list();

    return (
        <Container>
            <PageTitle
                title="Journal d'audit"
                description="Historique des actions sensibles effectuées dans votre organisation."
            />

            <div className="mt-6">
                <AuditLogPanel entries={entries} />
            </div>
        </Container>
    );
}
