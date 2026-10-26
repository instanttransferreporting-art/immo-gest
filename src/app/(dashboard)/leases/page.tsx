import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { LeasesPanel } from "@/features/leases/components/LeasesPanel";
import { ContratService } from "@/features/leases/services/contrat.service";
import { UniteService } from "@/features/units/services/unite.service";
import { LocataireService } from "@/features/tenants/services/locataire.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.leases.pageTitle} | ${t.common.appName}` };
}

export default async function LeasesPage() {
    const { t } = await getI18n();

    const [contrats, uniteOptions, locataireOptions] = await Promise.all([
        ContratService.listAll(),
        UniteService.listLibreOptions(),
        LocataireService.listOptions(),
    ]);

    return (
        <Container>
            <PageTitle
                title={t.leases.title}
                description={t.leases.description}
            />

            <div className="mt-6">
                <LeasesPanel
                    contrats={contrats}
                    uniteOptions={uniteOptions}
                    locataireOptions={locataireOptions}
                />
            </div>
        </Container>
    );
}
