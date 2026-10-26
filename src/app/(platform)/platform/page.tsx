import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { PlatformStatsCards } from "@/features/platform/components/PlatformStatsCards";
import { OrganizationsPanel } from "@/features/platform/components/OrganizationsPanel";
import { PlatformService } from "@/features/platform/services/platform.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.admin.platform.pageTitle} | ${t.common.appName}` };
}

export default async function PlatformPage() {
    const { t } = await getI18n();

    const [stats, organizations] = await Promise.all([
        PlatformService.getStats(),
        PlatformService.listOrganizations(),
    ]);

    return (
        <Container>
            <PageTitle title={t.admin.platform.pageTitle} description={t.admin.platform.description} />

            <div className="mt-6 space-y-6">
                <PlatformStatsCards stats={stats} />
                <OrganizationsPanel organizations={organizations} />
            </div>
        </Container>
    );
}
