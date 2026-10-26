import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { UsersPanel } from "@/features/users/components/UsersPanel";
import { UserManagementService } from "@/features/users/services/user-management.service";
import { effectiveOrganizationId, getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.admin.users.pageTitle} | ${t.common.appName}` };
}

export default async function UsersPage() {
    const { t } = await getI18n();

    const session = await getCurrentSession();
    const isAdmin = session?.user.role === RoleType.ADMIN || !!session?.user.impersonatedOrganizationId;

    if (!session || !isAdmin) {
        redirect(ROUTES.DASHBOARD);
    }

    const users = await UserManagementService.list(effectiveOrganizationId(session.user));

    return (
        <Container>
            <PageTitle
                title={t.admin.users.pageTitle}
                description={t.admin.users.description}
            />

            <div className="mt-6">
                <UsersPanel users={users} currentUserId={session.user.id} />
            </div>
        </Container>
    );
}
