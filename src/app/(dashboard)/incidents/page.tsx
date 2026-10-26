import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { IncidentsPanel } from "@/features/incidents/components/IncidentsPanel";
import { IncidentService } from "@/features/incidents/services/incident.service";
import { UniteService } from "@/features/units/services/unite.service";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.operations.incidents.pageTitle} | ${t.common.appName}` };
}

export default async function IncidentsPage() {
    const { t } = await getI18n();

    const [incidents, uniteOptions, immeubleOptions] = await Promise.all([
        IncidentService.listAll(),
        UniteService.listAllOptions(),
        ImmeubleService.listOptions(),
    ]);

    return (
        <Container>
            <PageTitle
                title={t.operations.incidents.pageTitle}
                description={t.operations.incidents.description}
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
