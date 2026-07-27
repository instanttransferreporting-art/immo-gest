import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

import { FactureRepository, type FactureRaw } from "@/features/invoices/repositories/facture.repository";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";
import { ContratService } from "@/features/leases/services/contrat.service";

const REFERENCE_PADDING = 6;
const MAX_REFERENCE_ATTEMPTS = 3;

export class ContratNotFoundError extends Error {
    constructor() {
        super("Le contrat est introuvable.");
        this.name = "ContratNotFoundError";
    }
}

export class DuplicateInvoiceError extends Error {
    constructor() {
        super("Une facture existe déjà pour ce contrat sur ce mois.");
        this.name = "DuplicateInvoiceError";
    }
}

export class FactureNotFoundError extends Error {
    constructor() {
        super("La facture est introuvable.");
        this.name = "FactureNotFoundError";
    }
}

async function generateNumeroFacture(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const count = await FactureRepository.countByNumeroPrefix(prefix);
    const nextNumber = (count + 1).toString().padStart(REFERENCE_PADDING, "0");

    return `${prefix}${nextNumber}`;
}

function getMonthRange(mois: number, annee: number): { start: Date; end: Date } {
    return {
        start: new Date(annee, mois - 1, 1),
        end: new Date(annee, mois, 1),
    };
}

function toFactureDTO(raw: FactureRaw): FactureDTO {
    const { echeance } = raw;
    const statut: FactureDTO["statut"] = raw.estSoldee
        ? "PAYEE"
        : echeance.soldeRestant < echeance.montantTotal
          ? "PARTIEL"
          : "EN_ATTENTE";

    return {
        id: raw.id,
        numero: raw.numero,
        echeanceId: echeance.id,
        contratId: echeance.contratId,
        mois: echeance.dateEcheance.getMonth() + 1,
        annee: echeance.dateEcheance.getFullYear(),
        montantLoyer: echeance.montantLoyer,
        montantCharges: echeance.montantCharges,
        montantTotal: echeance.montantTotal,
        penalites: raw.penalites,
        totalDu: raw.totalDu,
        soldeRestant: echeance.soldeRestant,
        statut,
        dateEmission: raw.dateEmission,
        contrat: {
            id: echeance.contrat.id,
            numeroContrat: echeance.contrat.numeroContrat,
            unite: echeance.contrat.unite,
            locataire: echeance.contrat.locataire,
        },
    };
}

export class FactureService {
    static async genererFactureMensuelle(contratId: string, mois: number, annee: number): Promise<FactureDTO> {
        const contrat = await ContratService.getById(contratId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        const { start, end } = getMonthRange(mois, annee);

        for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const numero = await generateNumeroFacture();

            try {
                return await prisma.$transaction(
                    async (tx) => {
                        const existing = await FactureRepository.findExistingForContratMonth(
                            contratId,
                            start,
                            end,
                            tx
                        );

                        if (existing) {
                            throw new DuplicateInvoiceError();
                        }

                        const raw = await FactureRepository.createEcheanceAndFacture(
                            {
                                contratId,
                                dateEcheance: start,
                                montantLoyer: contrat.loyerBase,
                                montantCharges: contrat.charges,
                                numero,
                            },
                            tx
                        );

                        return toFactureDTO(raw);
                    },
                    { maxWait: 10_000, timeout: 15_000 }
                );
            } catch (error) {
                if (error instanceof DuplicateInvoiceError) {
                    throw error;
                }

                if (!isUniqueConstraintError(error) || attempt === MAX_REFERENCE_ATTEMPTS) {
                    throw error;
                }
            }
        }

        throw new Error("Impossible de générer une référence unique pour la facture.");
    }

    static async genererFacturesDuMois(mois: number, annee: number): Promise<{ crees: number; ignorees: number }> {
        const contrats = await ContratService.listActive();

        let crees = 0;
        let ignorees = 0;

        for (const contrat of contrats) {
            try {
                await FactureService.genererFactureMensuelle(contrat.id, mois, annee);
                crees += 1;
            } catch (error) {
                if (error instanceof DuplicateInvoiceError) {
                    ignorees += 1;
                } else {
                    throw error;
                }
            }
        }

        return { crees, ignorees };
    }

    static async listAll(): Promise<FactureDTO[]> {
        const raws = await FactureRepository.findAll();
        return raws.map(toFactureDTO);
    }

    static async getById(id: string, client?: Prisma.TransactionClient): Promise<FactureDTO | null> {
        const raw = await FactureRepository.findById(id, client);
        return raw ? toFactureDTO(raw) : null;
    }

    static async registerPayment(
        factureId: string,
        echeanceId: string,
        soldeRestantActuel: number,
        montantPaye: number,
        client: Prisma.TransactionClient
    ): Promise<FactureDTO> {
        const nouveauSolde = Math.max(soldeRestantActuel - montantPaye, 0);
        const estSoldee = nouveauSolde <= 0;

        const updated = await FactureRepository.updateAfterPayment(
            factureId,
            echeanceId,
            { soldeRestant: nouveauSolde, estPaye: estSoldee, estSoldee },
            client
        );

        return toFactureDTO(updated);
    }
}
