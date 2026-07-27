import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { FactureService } from "@/features/invoices/services/facture.service";
import { PaiementService } from "@/features/payments/services/paiement.service";
import { FactureDetailPanel } from "@/features/payments/components/FactureDetailPanel";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const facture = await FactureService.getById(id);

    return {
        title: facture ? `Facture ${facture.numero} | Immo Gest` : "Facture | Immo Gest",
    };
}

export default async function FactureDetailPage({ params }: PageProps) {
    const { id } = await params;
    const facture = await FactureService.getById(id);

    if (!facture) {
        notFound();
    }

    const paiements = await PaiementService.listByFacture(id);

    return (
        <Container>
            <PageTitle
                title={`Facture ${facture.numero}`}
                description={`${facture.contrat.unite.immeuble.nom} — ${facture.contrat.unite.numero}`}
            />

            <div className="mt-6">
                <FactureDetailPanel facture={facture} paiements={paiements} />
            </div>
        </Container>
    );
}
