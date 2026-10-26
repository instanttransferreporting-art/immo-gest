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
import { StatutBail } from "@/generated/prisma/enums";
import { getI18n } from "@/i18n/server";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const [contrat, { t }] = await Promise.all([ContratService.getById(id), getI18n()]);

    return {
        title: `${contrat ? t.leases.contractTitle(contrat.numeroContrat) : t.leases.contractFallbackTitle} | ${t.common.appName}`,
    };
}

export default async function ContratDetailPage({ params }: PageProps) {
    const { t, f } = await getI18n();

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
                title={t.leases.contractTitle(contrat.numeroContrat)}
                description={`${contrat.unite.immeuble.nom} — ${contrat.unite.numero}`}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border border-border shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-col gap-3 px-6">
                        <CardTitle className="text-base font-semibold text-foreground">{t.leases.details}</CardTitle>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                render={<a href={`/api/export/contrat?contratId=${contrat.id}`} />}
                                variant="outline"
                                className="rounded-lg"
                                nativeButton={false}
                            >
                                <Download className="h-4 w-4" />
                                {t.leases.downloadLease}
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
                                <dt className="text-muted-foreground">{t.leases.tenant}</dt>
                                <dd className="font-medium text-foreground">{locataireNom}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.common.status}</dt>
                                <dd>
                                    <Badge variant="outline" className="rounded-lg">
                                        {t.enums.statutBail[contrat.statut]}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.leases.period}</dt>
                                <dd className="font-medium text-foreground">
                                    {f.date(contrat.dateDebut)} → {f.date(contrat.dateFin)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.leases.paymentFrequency}</dt>
                                <dd className="font-medium text-foreground">{t.enums.frequenceEcheance[contrat.frequence]}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.leases.baseRent}</dt>
                                <dd className="font-medium text-foreground">
                                    {f.currency(contrat.loyerBase)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.leases.charges}</dt>
                                <dd className="font-medium text-foreground">
                                    {f.currency(contrat.charges)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t.leases.securityDeposit}</dt>
                                <dd className="font-medium text-foreground">
                                    {f.currency(contrat.depotGarantie)}
                                </dd>
                            </div>
                            {contrat.statut === StatutBail.RESILIE && contrat.motifResiliation && (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground">{t.leases.terminationReason}</dt>
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
