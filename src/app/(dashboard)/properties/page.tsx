import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { ProprietairesPanel } from "@/features/properties/components/ProprietairesPanel";
import { ImmeublesPanel } from "@/features/properties/components/ImmeublesPanel";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.properties.pageTitle} | ${t.common.appName}` };
}

export default async function PropertiesPage() {
    const { t } = await getI18n();

    const [proprietaires, immeubles] = await Promise.all([
        ProprietaireService.listAll(),
        ImmeubleService.listAll(),
    ]);

    const proprietaireOptions = proprietaires.map((proprietaire) => ({
        id: proprietaire.id,
        nom: proprietaire.nom,
        prenom: proprietaire.prenom,
    }));

    return (
        <Container>
            <PageTitle
                title={t.properties.title}
                description={t.properties.description}
            />

            <div className="mt-6 space-y-6">
                <ProprietairesPanel proprietaires={proprietaires} />
                <ImmeublesPanel immeubles={immeubles} proprietaireOptions={proprietaireOptions} />
            </div>
        </Container>
    );
}
