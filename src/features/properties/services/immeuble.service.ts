import { ImmeubleRepository } from "@/features/properties/repositories/immeuble.repository";
import { ProprietaireRepository } from "@/features/properties/repositories/proprietaire.repository";
import type { ImmeubleFormValues } from "@/features/properties/schemas/property.schema";
import type { ImmeubleDTO, ImmeubleOptionDTO } from "@/features/properties/types/property.types";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

const REFERENCE_PADDING = 6;
const MAX_REFERENCE_ATTEMPTS = 3;

async function generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `IMM-${year}-`;
    const count = await ImmeubleRepository.countByReferencePrefix(prefix);
    const nextNumber = (count + 1).toString().padStart(REFERENCE_PADDING, "0");

    return `${prefix}${nextNumber}`;
}

export class ImmeubleService {
    static async create(input: ImmeubleFormValues): Promise<ImmeubleDTO | null> {
        const proprietaire = await ProprietaireRepository.findById(input.proprietaireId);

        if (!proprietaire) {
            return null;
        }

        for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const reference = await generateReference();

            try {
                return await ImmeubleRepository.create({ ...input, reference });
            } catch (error) {
                if (!isUniqueConstraintError(error) || attempt === MAX_REFERENCE_ATTEMPTS) {
                    throw error;
                }
            }
        }

        throw new Error("Impossible de générer une référence unique pour l'immeuble.");
    }

    static async listAll(): Promise<ImmeubleDTO[]> {
        return ImmeubleRepository.findAll();
    }

    static async getById(id: string): Promise<ImmeubleDTO | null> {
        return ImmeubleRepository.findById(id);
    }

    static async listOptions(): Promise<ImmeubleOptionDTO[]> {
        return ImmeubleRepository.findAllOptions();
    }
}
