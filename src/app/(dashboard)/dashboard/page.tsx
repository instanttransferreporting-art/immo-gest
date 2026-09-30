import { Download } from "lucide-react";

import {
    Container,
    PageTitle,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "@/features/dashboard/components/DashboardContent";
import { getCurrentSession } from "@/lib/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { RoleType } from "@/generated/prisma/enums";

export default async function DashboardPage() {
    const session = await getCurrentSession();
    const parcExportRoles: readonly RoleType[] = PERMISSIONS.PARC_EXPORT;
    const canExportParc =
        !!session && (!!session.user.impersonatedOrganizationId || parcExportRoles.includes(session.user.role));
    const isDirecteurGeneral =
        !!session && !session.user.impersonatedOrganizationId && session.user.role === RoleType.DIRECTEUR_GENERAL;

    return (

        <Container>

            <div className="flex items-start justify-between gap-4">
                <PageTitle
                    title="Dashboard"
                    description="Vue d'ensemble de votre activité."
                />

                {canExportParc && !isDirecteurGeneral && (
                    <Button
                        // eslint-disable-next-line @next/next/no-html-link-for-pages -- file download endpoint, not a page route
                        render={<a href="/api/export/parc" />}
                        variant="outline"
                        className="rounded-lg"
                        nativeButton={false}
                    >
                        <Download className="h-4 w-4" />
                        Exporter le parc (Excel)
                    </Button>
                )}
            </div>

            <div className="mt-6">
                <DashboardContent isDirecteurGeneral={isDirecteurGeneral} />
            </div>

        </Container>

    );

}
