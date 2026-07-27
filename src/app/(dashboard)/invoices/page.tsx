import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { FacturesPanel } from "@/features/invoices/components/FacturesPanel";
import { FactureService } from "@/features/invoices/services/facture.service";

export const metadata: Metadata = {
    title: "Factures | Immo Gest",
};

export default async function InvoicesPage() {
    const factures = await FactureService.listAll();

    return (
        <Container>
            <PageTitle
                title="Facturation"
                description="Générez et suivez les factures des contrats actifs."
            />

            <div className="mt-6">
                <FacturesPanel factures={factures} />
            </div>
        </Container>
    );
}
