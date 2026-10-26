import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { FactureService } from "@/features/invoices/services/facture.service";
import { PaiementService } from "@/features/payments/services/paiement.service";
import { FactureDetailPanel } from "@/features/payments/components/FactureDetailPanel";
import { getI18n } from "@/i18n/server";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const [facture, { t }] = await Promise.all([FactureService.getById(id), getI18n()]);

    return {
        title: `${facture ? t.invoices.invoiceTitle(facture.numero) : t.invoices.invoiceFallbackTitle} | ${t.common.appName}`,
    };
}

export default async function FactureDetailPage({ params }: PageProps) {
    const { t } = await getI18n();

    const { id } = await params;
    const facture = await FactureService.getById(id);

    if (!facture) {
        notFound();
    }

    const paiements = await PaiementService.listByFacture(id);

    return (
        <Container>
            <PageTitle
                title={t.invoices.invoiceTitle(facture.numero)}
                description={`${facture.contrat.unite.immeuble.nom} — ${facture.contrat.unite.numero}`}
            />

            <div className="mt-6">
                <FactureDetailPanel facture={facture} paiements={paiements} />
            </div>
        </Container>
    );
}
