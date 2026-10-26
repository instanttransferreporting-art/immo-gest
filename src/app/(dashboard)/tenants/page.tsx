import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { LocatairesPanel } from "@/features/tenants/components/LocatairesPanel";
import { LocataireService } from "@/features/tenants/services/locataire.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.tenants.pageTitle} | ${t.common.appName}` };
}

export default async function TenantsPage() {
    const { t } = await getI18n();

    const locataires = await LocataireService.listAll();

    return (
        <Container>
            <PageTitle
                title={t.tenants.pageTitle}
                description={t.tenants.description}
            />

            <div className="mt-6">
                <LocatairesPanel locataires={locataires} />
            </div>
        </Container>
    );
}
