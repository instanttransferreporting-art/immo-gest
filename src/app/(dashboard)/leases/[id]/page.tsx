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
import { GenererContratDialog } from "@/features/leases/components/GenererContratDialog";
import { ContratDocumentService } from "@/features/leases/services/contrat-document.service";
import { DocumentsContratPanel } from "@/features/leases/components/DocumentsContratPanel";
import { DocumentContratService } from "@/features/leases/services/document-contrat.service";
import { ContratStatutActions } from "@/features/leases/components/ContratStatutActions";
import { RenouvelerContratButton } from "@/features/leases/components/RenouvelerContratButton";
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
    const documents = await DocumentContratService.listByContrat(id);
    const documentDefaults = await ContratDocumentService.getDefaults(id);
    const locataireNom =
        contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`;

    return (
        <Container>
            <PageTitle
                title={`Contrat ${contrat.numeroContrat}`}
                description={`${contrat.unite.immeuble.nom} — ${contrat.unite.numero}`}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-col gap-3 px-6">
                        <CardTitle className="text-base font-semibold text-foreground">Détails du contrat</CardTitle>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                render={<a href={`/api/export/contrat?contratId=${contrat.id}`} />}
                                variant="outline"
                                className="rounded-lg"
                                nativeButton={false}
                            >
                                <Download className="h-4 w-4" />
                                Télécharger le bail
                            </Button>

                            <GenererContratDialog contratId={contrat.id} defaults={documentDefaults} />

                            {(contrat.statut === StatutBail.ACTIF || contrat.statut === StatutBail.SUSPENDU) && (
                                <ContratStatutActions contratId={contrat.id} statut={contrat.statut} />
                            )}

                            {contrat.statut === StatutBail.ACTIF && (
                                <RenouvelerContratButton
                                    contratId={contrat.id}
                                    loyerActuel={contrat.loyerBase}
                                    chargesActuelles={contrat.charges}
                                    depotGarantieActuel={contrat.depotGarantie}
                                />
                            )}

                            {contrat.statut === StatutBail.ACTIF && (
                                <ResilierContratButton contratId={contrat.id} />
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 px-6 py-2">
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Locataire</dt>
                                <dd className="font-medium text-foreground">{locataireNom}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Statut</dt>
                                <dd>
                                    <Badge variant="outline" className="rounded-lg">
                                        {STATUT_BAIL_LABELS[contrat.statut]}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Période</dt>
                                <dd className="font-medium text-foreground">
                                    {dateFormatter.format(contrat.dateDebut)} → {dateFormatter.format(contrat.dateFin)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Fréquence de paiement</dt>
                                <dd className="font-medium text-foreground">{FREQUENCE_LABELS[contrat.frequence]}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Loyer de base</dt>
                                <dd className="font-medium text-foreground">
                                    {currencyFormatter.format(contrat.loyerBase)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Charges</dt>
                                <dd className="font-medium text-foreground">
                                    {currencyFormatter.format(contrat.charges)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Dépôt de garantie</dt>
                                <dd className="font-medium text-foreground">
                                    {currencyFormatter.format(contrat.depotGarantie)}
                                </dd>
                            </div>
                            {contrat.statut === StatutBail.RESILIE && contrat.motifResiliation && (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground">Motif de résiliation</dt>
                                    <dd className="font-medium text-foreground">{contrat.motifResiliation}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <div className="space-y-6 lg:col-span-1">
                    {caution && <CautionPanel caution={caution} contratStatut={contrat.statut} />}
                    <DocumentsContratPanel
                        contratId={contrat.id}
                        documents={documents}
                        avecContratSuivant={contrat.dateDebut.getMonth() > 0 || contrat.dateDebut.getDate() > 1}
                    />
                </div>
            </div>
        </Container>
    );
}
