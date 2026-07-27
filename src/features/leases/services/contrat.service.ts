import { EtatUnite } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import type { ContratFormValues } from "@/features/leases/schemas/lease.schema";
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

async function generateNumeroContrat(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CTR-${year}-`;
    const count = await ContratRepository.countByNumeroPrefix(prefix);
    const nextNumber = (count + 1).toString().padStart(REFERENCE_PADDING, "0");

    return `${prefix}${nextNumber}`;
}

export class ContratService {
    static async create(input: ContratFormValues): Promise<ContratDTO> {
        for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const numeroContrat = await generateNumeroContrat();

            try {
                return await prisma.$transaction(
                    async (tx) => {
                        const unite = await UniteService.getById(input.uniteId, tx);

                        if (!unite || unite.etat !== EtatUnite.LIBRE) {
                            throw new UniteNotAvailableError();
                        }

                        const contrat = await ContratRepository.create({ ...input, numeroContrat }, tx);

                        await UniteService.updateEtat(input.uniteId, EtatUnite.OCCUPE, tx);

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
        return ContratRepository.findAll();
    }

    static async getById(id: string): Promise<ContratDTO | null> {
        return ContratRepository.findById(id);
    }

    static async listActive(): Promise<ContratDTO[]> {
        return ContratRepository.findAllActive();
    }
}
