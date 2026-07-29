import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Download } from "lucide-react";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContratService } from "@/features/leases/services/contrat.service";
import { CautionService } from "@/features/leases/services/caution.service";
import { CautionPanel } from "@/features/leases/components/CautionPanel";
import { ResilierContratButton } from "@/features/leases/components/ResilierContratButton";
import { FREQUENCE_LABELS, STATUT_BAIL_LABELS } from "@/features/leases/constants/lease.constants";
import { StatutBail } from "@/generated/prisma/enums";

type PageProps = {
    params: Promise<{ id: string }>;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const contrat = await ContratService.getById(id);

    return {
        title: contrat ? `Contrat ${contrat.numeroContrat} | Immo Gest` : "Contrat | Immo Gest",
    };
}

export default async function ContratDetailPage({ params }: PageProps) {
    const { id } = await params;
    const contrat = await ContratService.getById(id);

    if (!contrat) {
        notFound();
    }

    const caution = await CautionService.getByContrat(id);
    const locataireNom =
        contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`;

    return (
        <Container>
            <PageTitle
                title={`Contrat ${contrat.numeroContrat}`}
                description={`${contrat.unite.immeuble.nom} — ${contrat.unite.numero}`}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between px-6">
                        <CardTitle className="text-base font-semibold text-slate-900">Détails du contrat</CardTitle>

                        <div className="flex gap-2">
                            <Button
                                render={<a href={`/api/export/contrat?contratId=${contrat.id}`} />}
                                variant="outline"
                                className="rounded-lg"
                            >
                                <Download className="h-4 w-4" />
                                Télécharger le bail
                            </Button>

                            {contrat.statut === StatutBail.ACTIF && (
                                <ResilierContratButton contratId={contrat.id} />
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 px-6 py-2">
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-slate-500">Locataire</dt>
                                <dd className="font-medium text-slate-900">{locataireNom}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Statut</dt>
                                <dd>
                                    <Badge variant="outline" className="rounded-lg">
                                        {STATUT_BAIL_LABELS[contrat.statut]}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Période</dt>
                                <dd className="font-medium text-slate-900">
                                    {dateFormatter.format(contrat.dateDebut)} → {dateFormatter.format(contrat.dateFin)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Fréquence de paiement</dt>
                                <dd className="font-medium text-slate-900">{FREQUENCE_LABELS[contrat.frequence]}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Loyer de base</dt>
                                <dd className="font-medium text-slate-900">
                                    {currencyFormatter.format(contrat.loyerBase)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Charges</dt>
                                <dd className="font-medium text-slate-900">
                                    {currencyFormatter.format(contrat.charges)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Dépôt de garantie</dt>
                                <dd className="font-medium text-slate-900">
                                    {currencyFormatter.format(contrat.depotGarantie)}
                                </dd>
                            </div>
                            {contrat.statut === StatutBail.RESILIE && contrat.motifResiliation && (
                                <div className="sm:col-span-2">
                                    <dt className="text-slate-500">Motif de résiliation</dt>
                                    <dd className="font-medium text-slate-900">{contrat.motifResiliation}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <div className="lg:col-span-1">
                    {caution && <CautionPanel caution={caution} contratStatut={contrat.statut} />}
                </div>
            </div>
        </Container>
    );
}
