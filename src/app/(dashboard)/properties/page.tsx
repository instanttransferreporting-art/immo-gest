import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { ProprietairesPanel } from "@/features/properties/components/ProprietairesPanel";
import { ImmeublesPanel } from "@/features/properties/components/ImmeublesPanel";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";

export const metadata: Metadata = {
    title: "Patrimoine | Immo Gest",
};

export default async function PropertiesPage() {
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
                title="Patrimoine Immobilier"
                description="Gérez les propriétaires et les immeubles de votre parc."
            />

            <div className="mt-6 space-y-6">
                <ProprietairesPanel proprietaires={proprietaires} />
                <ImmeublesPanel immeubles={immeubles} proprietaireOptions={proprietaireOptions} />
            </div>
        </Container>
    );
}
