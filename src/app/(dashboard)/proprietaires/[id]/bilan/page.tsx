import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { ReversementService } from "@/features/payouts/services/reversement.service";
import { ReversementBilanPanel } from "@/features/payouts/components/ReversementBilanPanel";
import { getI18n } from "@/i18n/server";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const [proprietaire, { t }] = await Promise.all([ProprietaireService.getById(id), getI18n()]);

    return {
        title: `${proprietaire ? t.operations.payouts.pageTitle(proprietaire.nom) : t.operations.payouts.fallbackTitle} | ${t.common.appName}`,
    };
}

export default async function ProprietaireBilanPage({ params }: PageProps) {
    const { t } = await getI18n();

    const { id } = await params;
    const proprietaire = await ProprietaireService.getById(id);

    if (!proprietaire) {
        notFound();
    }

    const reversements = await ReversementService.listByProprietaire(id);

    return (
        <Container>
            <PageTitle
                title={t.operations.payouts.title(`${proprietaire.nom} ${proprietaire.prenom ?? ""}`.trim())}
                description={t.operations.payouts.commission(proprietaire.tauxCommission)}
            />

            <div className="mt-6">
                <ReversementBilanPanel proprietaireId={id} reversements={reversements} />
            </div>
        </Container>
    );
}
