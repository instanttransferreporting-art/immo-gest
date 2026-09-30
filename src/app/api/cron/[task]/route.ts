import { NextResponse, type NextRequest } from "next/server";

import { FrequenceEcheance, NiveauRelance } from "@/generated/prisma/enums";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ContratService } from "@/features/leases/services/contrat.service";
import { DuplicateInvoiceError, FactureService } from "@/features/invoices/services/facture.service";
import { RecouvrementService } from "@/features/collections/services/recouvrement.service";
import { RelanceService } from "@/features/collections/services/relance.service";
import { NIVEAU_RELANCE_ORDER } from "@/features/collections/constants/collection.constants";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Nombre de jours avant l'échéance auquel envoyer l'avis, selon la fréquence
// du contrat (§5 du cahier des charges). QUOTIDIEN (baux à la nuitée) est
// volontairement absent : ces contrats ne suivent pas le cycle mensuel classique.
const AVIS_OFFSET_JOURS: Partial<Record<FrequenceEcheance, number>> = {
    [FrequenceEcheance.MENSUEL]: 5,
    [FrequenceEcheance.BIMENSUEL]: 15,
    [FrequenceEcheance.TRIMESTRIEL]: 15,
    [FrequenceEcheance.SEMESTRIEL]: 30,
    [FrequenceEcheance.ANNUEL]: 30,
};

// Niveau de relance à déclencher selon le nombre de jours de retard (§7).
const RELANCE_TRIGGER_DAYS: Partial<Record<number, NiveauRelance>> = {
    0: NiveauRelance.NIVEAU_1,
    15: NiveauRelance.NIVEAU_1_BIS,
    30: NiveauRelance.NIVEAU_2,
};

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        return false;
    }

    const authHeader = request.headers.get("authorization");
    return authHeader === `Bearer ${secret}`;
}

async function runAvisEcheanceTask(): Promise<Record<string, unknown>> {
    const organizationIds = await OrganizationService.listAllActiveIds();

    let contratsEvalues = 0;
    let facturesGenerees = 0;
    let ignorees = 0;
    let erreurs = 0;

    const now = new Date();
    const prochaineEcheance = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const joursRestants = Math.round((prochaineEcheance.getTime() - today.getTime()) / MS_PER_DAY);

    for (const organizationId of organizationIds) {
        const contrats = await ContratService.listActiveForOrganization(organizationId);

        for (const contrat of contrats) {
            const offset = AVIS_OFFSET_JOURS[contrat.frequence];

            if (!offset || joursRestants !== offset) {
                continue;
            }

            contratsEvalues += 1;

            try {
                await FactureService.genererFactureMensuelleForOrganization(
                    organizationId,
                    contrat.id,
                    prochaineEcheance.getMonth() + 1,
                    prochaineEcheance.getFullYear()
                );
                facturesGenerees += 1;
            } catch (error) {
                if (error instanceof DuplicateInvoiceError) {
                    ignorees += 1;
                } else {
                    erreurs += 1;
                    console.error(`[cron] avis-echeance: échec pour le contrat ${contrat.id}`, error);
                }
            }
        }
    }

    return { organisationsTraitees: organizationIds.length, contratsEvalues, facturesGenerees, ignorees, erreurs };
}

async function runRelancesTask(): Promise<Record<string, unknown>> {
    const organizationIds = await OrganizationService.listAllActiveIds();

    let facturesEvaluees = 0;
    let relancesEnvoyees = 0;
    let erreurs = 0;

    for (const organizationId of organizationIds) {
        const impayes = await RecouvrementService.listImpayesForOrganization(organizationId);

        for (const impaye of impayes) {
            facturesEvaluees += 1;

            const niveauCible = RELANCE_TRIGGER_DAYS[impaye.joursRetard];

            if (!niveauCible) {
                continue;
            }

            const dejaAuNiveauOuSuperieur =
                impaye.dernierNiveauRelance !== null &&
                NIVEAU_RELANCE_ORDER.indexOf(impaye.dernierNiveauRelance) >= NIVEAU_RELANCE_ORDER.indexOf(niveauCible);

            if (dejaAuNiveauOuSuperieur) {
                continue;
            }

            try {
                await RelanceService.genererRelanceForOrganization(organizationId, {
                    echeanceId: impaye.echeanceId,
                    niveau: niveauCible,
                });
                relancesEnvoyees += 1;
            } catch (error) {
                erreurs += 1;
                console.error(`[cron] relances: échec pour l'échéance ${impaye.echeanceId}`, error);
            }
        }
    }

    return { organisationsTraitees: organizationIds.length, facturesEvaluees, relancesEnvoyees, erreurs };
}

type RouteParams = { params: Promise<{ task: string }> };

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const { task } = await params;
    const startedAt = Date.now();

    try {
        let result: Record<string, unknown>;

        switch (task) {
            case "avis-echeance":
                result = await runAvisEcheanceTask();
                break;
            case "relances":
                result = await runRelancesTask();
                break;
            default:
                return NextResponse.json({ error: "Tâche inconnue." }, { status: 404 });
        }

        const durationMs = Date.now() - startedAt;
        console.log(`[cron] ${task} terminé en ${durationMs}ms`, result);

        return NextResponse.json({ task, durationMs, ...result });
    } catch (error) {
        console.error(`[cron] Échec de la tâche ${task}`, error);
        return NextResponse.json({ error: "Une erreur est survenue lors de l'exécution de la tâche." }, { status: 500 });
    }
}
