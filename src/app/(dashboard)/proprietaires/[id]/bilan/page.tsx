import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { ReversementService } from "@/features/payouts/services/reversement.service";
import { ReversementBilanPanel } from "@/features/payouts/components/ReversementBilanPanel";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const proprietaire = await ProprietaireService.getById(id);

    return {
        title: proprietaire ? `Bilan ${proprietaire.nom} | Immo Gest` : "Bilan Propriétaire | Immo Gest",
    };
}

export default async function ProprietaireBilanPage({ params }: PageProps) {
    const { id } = await params;
    const proprietaire = await ProprietaireService.getById(id);

    if (!proprietaire) {
        notFound();
    }

    const reversements = await ReversementService.listByProprietaire(id);

    return (
        <Container>
            <PageTitle
                title={`Bilan de ${proprietaire.nom} ${proprietaire.prenom ?? ""}`.trim()}
                description={`Commission de l'agence : ${proprietaire.tauxCommission}%`}
            />

            <div className="mt-6">
                <ReversementBilanPanel proprietaireId={id} reversements={reversements} />
            </div>
        </Container>
    );
}
