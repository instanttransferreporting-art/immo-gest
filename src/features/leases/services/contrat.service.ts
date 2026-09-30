import { EtatUnite, FrequenceEcheance, StatutBail } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { CautionService } from "@/features/leases/services/caution.service";
import { calculateDateFinAuto } from "@/features/leases/services/contrat-calculator";
import type { ContratFormValues, ResiliationFormValues } from "@/features/leases/schemas/lease.schema";
import type { ContratDTO } from "@/features/leases/types/lease.types";
import { UniteService } from "@/features/units/services/unite.service";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

const REFERENCE_PADDING = 6;
const MAX_REFERENCE_ATTEMPTS = 3;

export class UniteNotAvailableError extends Error {
    constructor() {
        super("Cette unité n'est plus disponible.");
        this.name = "UniteNotAvailableError";
    }
}

export class ContratNotFoundError extends Error {
    constructor() {
        super("Le contrat est introuvable.");
        this.name = "ContratNotFoundError";
    }
}

export class ContratNotActifError extends Error {
    constructor() {
        super("Seul un contrat actif peut être résilié.");
        this.name = "ContratNotActifError";
    }
}

export class ContratStatutInvalideError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ContratStatutInvalideError";
    }
}

async function generateNumeroContrat(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CTR-${year}-`;
    const count = await ContratRepository.countByNumeroPrefix(organizationId, prefix);
    const nextNumber = (count + 1).toString().padStart(REFERENCE_PADDING, "0");

    return `${prefix}${nextNumber}`;
}

export class ContratService {
    static async create(input: ContratFormValues): Promise<ContratDTO> {
        const organizationId = await getCurrentOrganizationId();

        for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const numeroContrat = await generateNumeroContrat(organizationId);

            try {
                return await prisma.$transaction(
                    async (tx) => {
                        const unite = await UniteService.getById(input.uniteId, organizationId, tx);

                        if (!unite || unite.etat !== EtatUnite.LIBRE) {
                            throw new UniteNotAvailableError();
                        }

                        const dateFin =
                            input.frequence === FrequenceEcheance.QUOTIDIEN
                                ? input.dateFin
                                : calculateDateFinAuto(input.dateDebut);

                        const contrat = await ContratRepository.create(
                            organizationId,
                            { ...input, dateFin, numeroContrat },
                            tx
                        );

                        await UniteService.updateEtat(input.uniteId, EtatUnite.OCCUPE, organizationId, tx);

                        await CautionService.createForContrat(
                            organizationId,
                            contrat.id,
                            input.depotGarantie,
                            tx
                        );

                        return contrat;
                    },
                    { maxWait: 10_000, timeout: 15_000 }
                );
            } catch (error) {
                if (error instanceof UniteNotAvailableError) {
                    throw error;
                }

                if (!isUniqueConstraintError(error) || attempt === MAX_REFERENCE_ATTEMPTS) {
                    throw error;
                }
            }
        }

        throw new Error("Impossible de générer une référence unique pour le contrat.");
    }

    static async listAll(): Promise<ContratDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return ContratRepository.findAll(organizationId);
    }

    static async getById(id: string): Promise<ContratDTO | null> {
        const organizationId = await getCurrentOrganizationId();
        return ContratRepository.findById(id, organizationId);
    }

    static async getByIdForOrganization(id: string, organizationId: string): Promise<ContratDTO | null> {
        return ContratRepository.findById(id, organizationId);
    }

    static async listActive(): Promise<ContratDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return ContratRepository.findAllActive(organizationId);
    }

    /**
     * Variante sans dépendance à la session — pour les tâches planifiées
     * (LOT-17) qui itèrent sur toutes les organisations sans contexte utilisateur.
     */
    static async listActiveForOrganization(organizationId: string): Promise<ContratDTO[]> {
        return ContratRepository.findAllActive(organizationId);
    }

    static async resilierContrat(input: ResiliationFormValues): Promise<ContratDTO> {
        const organizationId = await getCurrentOrganizationId();

        return prisma.$transaction(
            async (tx) => {
                const contrat = await ContratRepository.findById(input.contratId, organizationId, tx);

                if (!contrat) {
                    throw new ContratNotFoundError();
                }

                if (contrat.statut !== StatutBail.ACTIF) {
                    throw new ContratNotActifError();
                }

                const updated = await ContratRepository.updateResiliation(
                    input.contratId,
                    organizationId,
                    { dateFin: input.dateFin, motifResiliation: input.motif },
                    tx
                );

                if (!updated || updated.statut !== StatutBail.RESILIE) {
                    throw new ContratNotActifError();
                }

                await UniteService.updateEtat(updated.uniteId, EtatUnite.LIBRE, organizationId, tx);

                return updated;
            },
            { maxWait: 10_000, timeout: 15_000 }
        );
    }

    static async suspendreContrat(contratId: string): Promise<ContratDTO> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findById(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        if (contrat.statut !== StatutBail.ACTIF) {
            throw new ContratStatutInvalideError("Seul un contrat actif peut être suspendu.");
        }

        const updated = await ContratRepository.updateStatut(
            contratId,
            organizationId,
            StatutBail.ACTIF,
            StatutBail.SUSPENDU
        );

        if (!updated) {
            throw new ContratNotFoundError();
        }

        return updated;
    }

    static async reactiverContrat(contratId: string): Promise<ContratDTO> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findById(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        if (contrat.statut !== StatutBail.SUSPENDU) {
            throw new ContratStatutInvalideError("Seul un contrat suspendu peut être réactivé.");
        }

        const updated = await ContratRepository.updateStatut(
            contratId,
            organizationId,
            StatutBail.SUSPENDU,
            StatutBail.ACTIF
        );

        if (!updated) {
            throw new ContratNotFoundError();
        }

        return updated;
    }

    static async renouvelerContrat(
        contratId: string,
        overrides?: Partial<{ loyerBase: number; charges: number; depotGarantie: number }>
    ): Promise<ContratDTO> {
        const organizationId = await getCurrentOrganizationId();

        for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const numeroContrat = await generateNumeroContrat(organizationId);

            try {
                return await prisma.$transaction(
                    async (tx) => {
                        const contrat = await ContratRepository.findById(contratId, organizationId, tx);

                        if (!contrat) {
                            throw new ContratNotFoundError();
                        }

                        if (contrat.statut !== StatutBail.ACTIF) {
                            throw new ContratStatutInvalideError("Seul un contrat actif peut être renouvelé.");
                        }

                        const dateDebut = new Date(contrat.dateFin);
                        dateDebut.setDate(dateDebut.getDate() + 1);

                        let dateFin: Date;

                        if (contrat.frequence === FrequenceEcheance.QUOTIDIEN && contrat.nombreNuitees) {
                            dateFin = new Date(dateDebut);
                            dateFin.setDate(dateFin.getDate() + contrat.nombreNuitees - 1);
                        } else {
                            dateFin = calculateDateFinAuto(dateDebut);
                        }

                        const loyerBase = overrides?.loyerBase ?? contrat.loyerBase;
                        const charges = overrides?.charges ?? contrat.charges;
                        const depotGarantie = overrides?.depotGarantie ?? contrat.depotGarantie;

                        const nouveauContrat = await ContratRepository.create(
                            organizationId,
                            {
                                uniteId: contrat.uniteId,
                                locataireId: contrat.locataireId,
                                dateDebut,
                                dateFin,
                                loyerBase,
                                charges,
                                depotGarantie,
                                frequence: contrat.frequence,
                                nombreNuitees: contrat.nombreNuitees ?? undefined,
                                numeroContrat,
                            },
                            tx
                        );

                        await CautionService.createForContrat(organizationId, nouveauContrat.id, depotGarantie, tx);

                        await ContratRepository.updateStatut(
                            contratId,
                            organizationId,
                            StatutBail.ACTIF,
                            StatutBail.EXPIRE,
                            tx
                        );

                        return nouveauContrat;
                    },
                    { maxWait: 10_000, timeout: 15_000 }
                );
            } catch (error) {
                if (error instanceof ContratNotFoundError || error instanceof ContratStatutInvalideError) {
                    throw error;
                }

                if (!isUniqueConstraintError(error) || attempt === MAX_REFERENCE_ATTEMPTS) {
                    throw error;
                }
            }
        }

        throw new Error("Impossible de générer une référence unique pour le contrat.");
    }
}
