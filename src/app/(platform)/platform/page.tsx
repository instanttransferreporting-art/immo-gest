import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { PlatformStatsCards } from "@/features/platform/components/PlatformStatsCards";
import { OrganizationsPanel } from "@/features/platform/components/OrganizationsPanel";
import { PlatformService } from "@/features/platform/services/platform.service";

export const metadata: Metadata = {
    title: "Plateforme | Immo Gest",
};

export default async function PlatformPage() {
    const [stats, organizations] = await Promise.all([
        PlatformService.getStats(),
        PlatformService.listOrganizations(),
    ]);

    return (
        <Container>
            <PageTitle title="Plateforme" description="Vue d'ensemble et gestion des entreprises." />

            <div className="mt-6 space-y-6">
                <PlatformStatsCards stats={stats} />
                <OrganizationsPanel organizations={organizations} />
            </div>
        </Container>
    );
}
