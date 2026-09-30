import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { PaiementsPanel } from "@/features/payments/components/PaiementsPanel";
import { PaiementService } from "@/features/payments/services/paiement.service";

export const metadata: Metadata = {
    title: "Paiements | Immo Gest",
};

export default async function PaymentsPage() {
    const paiements = await PaiementService.listAll();

    return (
        <Container>
            <PageTitle
                title="Paiements"
                description="Historique de tous les paiements enregistrés sur les factures."
            />

            <div className="mt-6">
                <PaiementsPanel paiements={paiements} />
            </div>
        </Container>
    );
}
