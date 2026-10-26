import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { formatOrganizationAdresse, formatOrganizationContact } from "@/lib/organization-format";
import { getI18n } from "@/i18n/server";

export default async function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const session = await getCurrentSession();

    if (!session) {
        redirect(ROUTES.LOGIN);
    }

    if (session.user.role === RoleType.SUPER_ADMIN && !session.user.impersonatedOrganizationId) {
        redirect(ROUTES.PLATFORM);
    }

    const [organization, { t }] = await Promise.all([OrganizationService.getCurrent(), getI18n()]);

    return (
        <AppShell
            branding={{
                organizationNom: organization.nom,
                logo: organization.logo,
                logoDocument: organization.logoDocument,
                organizationAdresse: formatOrganizationAdresse(organization),
                organizationContact: formatOrganizationContact(organization, t.common.phoneShort),
            }}
        >
            {children}
        </AppShell>
    );
}