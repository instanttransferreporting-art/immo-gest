import { ReversementRepository } from "@/features/payouts/repositories/reversement.repository";
import type { ReversementDTO } from "@/features/payouts/types/payout.types";
import { ProprietaireService } from "@/features/properties/services/proprietaire.service";

export class ProprietaireNotFoundError extends Error {
    constructor() {
        super("Le propriétaire est introuvable.");
        this.name = "ProprietaireNotFoundError";
    }
}

export class DuplicateReversementError extends Error {
    constructor() {
        super("Un reversement existe déjà pour ce propriétaire sur ce mois.");
        this.name = "DuplicateReversementError";
    }
}

export class ReversementNotFoundError extends Error {
    constructor() {
        super("Le reversement est introuvable.");
        this.name = "ReversementNotFoundError";
    }
}

function getMonthRange(mois: number, annee: number): { start: Date; end: Date } {
    return {
        start: new Date(annee, mois - 1, 1),
        end: new Date(annee, mois, 1),
    };
}

export class ReversementService {
    static async genererReversement(proprietaireId: string, mois: number, annee: number): Promise<ReversementDTO> {
        const proprietaire = await ProprietaireService.getById(proprietaireId);

        if (!proprietaire) {
            throw new ProprietaireNotFoundError();
        }

        const existing = await ReversementRepository.findExisting(proprietaireId, mois, annee);

        if (existing) {
            throw new DuplicateReversementError();
        }

        const { start, end } = getMonthRange(mois, annee);
        const totalEncaisse = await ReversementRepository.sumEncaisseForProprietaireMonth(
            proprietaireId,
            start,
            end
        );

        const commission = (totalEncaisse * proprietaire.tauxCommission) / 100;
        const netAPayer = totalEncaisse - commission;

        return ReversementRepository.create({
            proprietaireId,
            mois,
            annee,
            totalEncaisse,
            tauxCommission: proprietaire.tauxCommission,
            commission,
            netAPayer,
        });
    }

    static async validerReversement(reversementId: string): Promise<ReversementDTO> {
        const reversement = await ReversementRepository.findById(reversementId);

        if (!reversement) {
            throw new ReversementNotFoundError();
        }

        return ReversementRepository.markValide(reversementId);
    }

    static async listByProprietaire(proprietaireId: string): Promise<ReversementDTO[]> {
        return ReversementRepository.findByProprietaire(proprietaireId);
    }
}
