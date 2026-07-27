import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { LeasesPanel } from "@/features/leases/components/LeasesPanel";
import { ContratService } from "@/features/leases/services/contrat.service";
import { UniteService } from "@/features/units/services/unite.service";
import { LocataireService } from "@/features/tenants/services/locataire.service";

export const metadata: Metadata = {
    title: "Contrats | Immo Gest",
};

export default async function LeasesPage() {
    const [contrats, uniteOptions, locataireOptions] = await Promise.all([
        ContratService.listAll(),
        UniteService.listLibreOptions(),
        LocataireService.listOptions(),
    ]);

    return (
        <Container>
            <PageTitle
                title="Contrats de Bail"
                description="Gérez les contrats de location et suivez leur statut."
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
