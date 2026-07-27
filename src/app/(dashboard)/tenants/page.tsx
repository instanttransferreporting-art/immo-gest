import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { LocatairesPanel } from "@/features/tenants/components/LocatairesPanel";
import { LocataireService } from "@/features/tenants/services/locataire.service";

export const metadata: Metadata = {
    title: "Locataires | Immo Gest",
};

export default async function TenantsPage() {
    const locataires = await LocataireService.listAll();

    return (
        <Container>
            <PageTitle
                title="Locataires"
                description="Gérez les fiches locataires, personnes physiques et morales."
            />

            <div className="mt-6">
                <LocatairesPanel locataires={locataires} />
            </div>
        </Container>
    );
}
