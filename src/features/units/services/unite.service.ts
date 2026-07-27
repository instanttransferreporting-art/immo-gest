import type { Prisma } from "@/generated/prisma/client";
import type { EtatUnite } from "@/generated/prisma/enums";
import { UniteRepository } from "@/features/units/repositories/unite.repository";
import type { UniteFormValues } from "@/features/units/schemas/unit.schema";
import type { UniteDTO, UniteLibreOptionDTO, UniteOptionDTO } from "@/features/units/types/unit.types";

export class UniteService {
    static async create(input: UniteFormValues): Promise<UniteDTO> {
        return UniteRepository.create(input);
    }

    static async listByImmeuble(immeubleId: string): Promise<UniteDTO[]> {
        return UniteRepository.findByImmeuble(immeubleId);
    }

    static async getById(id: string, client?: Prisma.TransactionClient): Promise<UniteDTO | null> {
        return UniteRepository.findById(id, client);
    }

    static async listLibreOptions(): Promise<UniteLibreOptionDTO[]> {
        return UniteRepository.findAllLibreOptions();
    }

    static async listAllOptions(): Promise<UniteOptionDTO[]> {
        return UniteRepository.findAllOptions();
    }

    static async updateEtat(id: string, etat: EtatUnite, client?: Prisma.TransactionClient): Promise<UniteDTO> {
        return UniteRepository.updateEtat(id, etat, client);
    }
}
