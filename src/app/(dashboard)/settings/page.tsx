import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { OrganizationForm } from "@/features/organizations/components/OrganizationForm";
import { OrganizationService } from "@/features/organizations/services/organization.service";

export const metadata: Metadata = {
    title: "Paramètres | Immo Gest",
};

export default async function SettingsPage() {
    const [session, organization] = await Promise.all([getCurrentSession(), OrganizationService.getCurrent()]);

    const canEdit = session?.user.role === RoleType.ADMIN || !!session?.user.impersonatedOrganizationId;

    return (
        <Container>
            <PageTitle title="Paramètres" description="Gérez les informations de votre agence." />

            <div className="mt-6">
                <Card className="rounded-2xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-6">
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Paramètres de l&apos;agence
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-6">
                        <OrganizationForm organization={organization} canEdit={canEdit} />
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
