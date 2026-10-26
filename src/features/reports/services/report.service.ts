import { subMonths } from "date-fns";

import { StatutBail } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { ReportRepository } from "@/features/reports/repositories/report.repository";
import { UniteRepository } from "@/features/units/repositories/unite.repository";
import { PaiementRepository } from "@/features/payments/repositories/paiement.repository";
import { FactureRepository } from "@/features/invoices/repositories/facture.repository";
import {
    isInPeriod,
    NO_PERIOD,
    periodLengthInDays,
    type ReportPeriod,
} from "@/features/reports/period";
import type {
    OccupationImmeubleDTO,
    PerformanceSummaryDTO,
    RendementImmeubleDTO,
    RentabiliteGlobaleDTO,
    ReportSummaryDTO,
} from "@/features/reports/types/report.types";

const EXPIRED_STATUTS: StatutBail[] = [StatutBail.RESILIE, StatutBail.EXPIRE];

async function getSummariesCore(organizationId: string, period: ReportPeriod): Promise<ReportSummaryDTO[]> {
    const [locataires, biens, contratsActifs, contratsExpires, loyersFactures, loyersEncaisses, impayes, cautions, charges] =
        await Promise.all([
            ReportRepository.getLocatairesSummary(organizationId, period),
            ReportRepository.getBiensSummary(organizationId),
            ReportRepository.getContratsActifsSummary(organizationId, period),
            ReportRepository.getContratsExpiresSummary(organizationId, EXPIRED_STATUTS, period),
            ReportRepository.getLoyersFacturesSummary(organizationId, period),
            ReportRepository.getLoyersEncaissesSummary(organizationId, period),
            ReportRepository.getImpayesSummary(organizationId, period),
            ReportRepository.getCautionsSummary(organizationId, period),
            ReportRepository.getChargesSummary(organizationId, period),
        ]);

    return [
        { type: "locataires", ...locataires },
        { type: "biens", ...biens },
        { type: "contrats-actifs", ...contratsActifs },
        { type: "contrats-expires", ...contratsExpires },
        { type: "loyers-factures", ...loyersFactures },
        { type: "loyers-encaisses", ...loyersEncaisses },
        { type: "impayes", ...impayes },
        { type: "cautions", ...cautions },
        { type: "charges", ...charges },
    ];
}

async function getPerformanceSummaryCore(
    organizationId: string,
    period: ReportPeriod
): Promise<PerformanceSummaryDTO> {
    const [unites, allPaiements, allFactures] = await Promise.all([
        UniteRepository.findAllWithImmeubleAndEtat(organizationId),
        PaiementRepository.findAllForPerformance(organizationId),
        FactureRepository.findAll(organizationId),
    ]);

    // Totaux de rentabilité : sur la période choisie (échéance des factures, date des paiements).
    const paiements = allPaiements.filter((paiement) => isInPeriod(paiement.datePaiement, period));
    const facturesAggregate = allFactures.filter((facture) => isInPeriod(facture.echeance.dateEcheance, period));

    // Rendement annuel : sur une période complète (du … au …), revenu annualisé ;
    // sinon, comme avant, les 12 derniers mois glissants.
    const periodDays = periodLengthInDays(period);
    const rendementPeriod: ReportPeriod =
        periodDays !== null ? period : { ...NO_PERIOD, start: subMonths(new Date(), 12) };
    const annualisation = periodDays !== null && periodDays > 0 ? 365 / periodDays : 1;
    const rendementBasis: PerformanceSummaryDTO["rendementBasis"] = periodDays !== null ? "period" : "rolling12";

    type ImmeubleAgg = {
        immeubleId: string;
        nom: string;
        valeurEstimative: number | null;
        totalUnites: number;
        unitesOccupees: number;
        revenuAnnuel: number;
    };

    const parImmeuble = new Map<string, ImmeubleAgg>();

    for (const unite of unites) {
        const existing = parImmeuble.get(unite.immeubleId);
        const totalUnites = (existing?.totalUnites ?? 0) + 1;
        const unitesOccupees = (existing?.unitesOccupees ?? 0) + (unite.etat === "OCCUPE" ? 1 : 0);

        parImmeuble.set(unite.immeubleId, {
            immeubleId: unite.immeubleId,
            nom: unite.immeuble.nom,
            valeurEstimative: unite.immeuble.valeurEstimative,
            totalUnites,
            unitesOccupees,
            revenuAnnuel: existing?.revenuAnnuel ?? 0,
        });
    }

    for (const paiement of allPaiements) {
        if (!isInPeriod(paiement.datePaiement, rendementPeriod)) {
            continue;
        }

        const immeubleId = paiement.echeance.contrat.unite.immeubleId;
        const existing = parImmeuble.get(immeubleId);

        if (existing) {
            existing.revenuAnnuel += paiement.montant;
        }
    }

    const immeubles = [...parImmeuble.values()];

    const occupationParImmeuble: OccupationImmeubleDTO[] = immeubles.map((immeuble) => ({
        immeubleId: immeuble.immeubleId,
        immeubleNom: immeuble.nom,
        totalUnites: immeuble.totalUnites,
        unitesOccupees: immeuble.unitesOccupees,
        tauxOccupation: immeuble.totalUnites > 0 ? (immeuble.unitesOccupees / immeuble.totalUnites) * 100 : 0,
    }));

    const rendementParImmeuble: RendementImmeubleDTO[] = immeubles.map((immeuble) => ({
        immeubleId: immeuble.immeubleId,
        immeubleNom: immeuble.nom,
        valeurEstimative: immeuble.valeurEstimative,
        revenuAnnuelEncaisse: immeuble.revenuAnnuel * annualisation,
        rendement:
            immeuble.valeurEstimative && immeuble.valeurEstimative > 0
                ? ((immeuble.revenuAnnuel * annualisation) / immeuble.valeurEstimative) * 100
                : null,
    }));

    const totalFacture = facturesAggregate.reduce((sum, facture) => sum + facture.totalDu, 0);
    const totalEncaisse = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    const totalImpaye = facturesAggregate
        .filter((facture) => !facture.estSoldee)
        .reduce((sum, facture) => sum + facture.totalDu, 0);

    const rentabiliteGlobale: RentabiliteGlobaleDTO = {
        totalFacture,
        totalEncaisse,
        totalImpaye,
        tauxRecouvrement: totalFacture > 0 ? (totalEncaisse / totalFacture) * 100 : 0,
    };

    return { rendementBasis, occupationParImmeuble, rendementParImmeuble, rentabiliteGlobale };
}

export class ReportService {
    static async getSummaries(period: ReportPeriod = NO_PERIOD): Promise<ReportSummaryDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return getSummariesCore(organizationId, period);
    }

    static async getPerformanceSummary(period: ReportPeriod = NO_PERIOD): Promise<PerformanceSummaryDTO> {
        const organizationId = await getCurrentOrganizationId();
        return getPerformanceSummaryCore(organizationId, period);
    }
}
