import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { IncidentsPanel } from "@/features/incidents/components/IncidentsPanel";
import { IncidentService } from "@/features/incidents/services/incident.service";
import { UniteService } from "@/features/units/services/unite.service";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";

export const metadata: Metadata = {
    title: "Incidents | Immo Gest",
};

export default async function IncidentsPage() {
    const [incidents, uniteOptions, immeubleOptions] = await Promise.all([
        IncidentService.listAll(),
        UniteService.listAllOptions(),
        ImmeubleService.listOptions(),
    ]);

    return (
        <Container>
            <PageTitle
                title="Incidents"
                description="Suivez les pannes, réparations et interventions signalées."
            />

            <div className="mt-6">
                <IncidentsPanel
                    incidents={incidents}
                    uniteOptions={uniteOptions}
                    immeubleOptions={immeubleOptions}
                />
            </div>
        </Container>
    );
}
