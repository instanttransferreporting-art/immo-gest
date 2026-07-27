import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ImmeubleService } from "@/features/properties/services/immeuble.service";
import { UniteService } from "@/features/units/services/unite.service";
import { UnitesPanel } from "@/features/units/components/UnitesPanel";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const immeuble = await ImmeubleService.getById(id);

    return {
        title: immeuble ? `${immeuble.nom} | Immo Gest` : "Immeuble | Immo Gest",
    };
}

export default async function ImmeubleDetailPage({ params }: PageProps) {
    const { id } = await params;
    const immeuble = await ImmeubleService.getById(id);

    if (!immeuble) {
        notFound();
    }

    const unites = await UniteService.listByImmeuble(id);

    return (
        <Container>
            <PageTitle
                title={immeuble.nom}
                description={`${immeuble.reference} · ${immeuble.adresse}, ${immeuble.ville}`}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
                    <CardContent className="space-y-3 px-6 py-2">
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Propriétaire</dt>
                                <dd className="font-medium text-slate-900">
                                    {`${immeuble.proprietaire.nom} ${immeuble.proprietaire.prenom ?? ""}`.trim()}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Niveaux</dt>
                                <dd className="font-medium text-slate-900">{immeuble.nombreNiveaux}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Logements</dt>
                                <dd className="font-medium text-slate-900">{immeuble.nombreLogements}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Unités enregistrées</dt>
                                <dd className="font-medium text-slate-900">{unites.length}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <UnitesPanel immeubleId={id} unites={unites} />
                </div>
            </div>
        </Container>
    );
}
