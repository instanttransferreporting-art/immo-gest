import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { OrganizationForm } from "@/features/organizations/components/OrganizationForm";
import { OrganizationLogoUploader } from "@/features/organizations/components/OrganizationLogoUploader";
import { removeOrganizationLogo, uploadOrganizationLogo } from "@/features/organizations/actions/organization.actions";
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

            <div className="mt-6 space-y-6">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardHeader className="px-6">
                        <CardTitle className="text-base font-semibold text-foreground">Logos de l&apos;agence</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Logo de l&apos;application</p>
                            <OrganizationLogoUploader
                                kind="sidebar"
                                logo={organization.logo}
                                organizationNom={organization.nom}
                                canEdit={canEdit}
                                onUpload={uploadOrganizationLogo}
                                onRemove={removeOrganizationLogo}
                            />
                        </div>

                        <div className="space-y-3 border-t border-border pt-6">
                            <p className="text-sm font-medium text-foreground">Logo des documents imprimés</p>
                            <OrganizationLogoUploader
                                kind="document"
                                logo={organization.logoDocument}
                                organizationNom={organization.nom}
                                canEdit={canEdit}
                                onUpload={uploadOrganizationLogo}
                                onRemove={removeOrganizationLogo}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardHeader className="px-6">
                        <CardTitle className="text-base font-semibold text-foreground">
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
