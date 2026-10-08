import type { Prisma } from "@/generated/prisma/client";
import type { EtatUnite } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { UniteRepository } from "@/features/units/repositories/unite.repository";
import type { UniteFormValues, UniteUpdateFormValues } from "@/features/units/schemas/unit.schema";
import type { UniteDTO, UniteLibreOptionDTO, UniteOptionDTO } from "@/features/units/types/unit.types";

export class UniteService {
    static async create(input: UniteFormValues): Promise<UniteDTO> {
        const organizationId = await getCurrentOrganizationId();
        return UniteRepository.create(organizationId, input);
    }

    static async update(id: string, input: UniteUpdateFormValues): Promise<UniteDTO | null> {
        const organizationId = await getCurrentOrganizationId();
        await UniteRepository.update(id, organizationId, input);
        return UniteRepository.findById(id, organizationId);
    }

    static async listByImmeuble(immeubleId: string): Promise<UniteDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return UniteRepository.findByImmeuble(immeubleId, organizationId);
    }

    static async getById(
        id: string,
        organizationId: string,
        client?: Prisma.TransactionClient
    ): Promise<UniteDTO | null> {
        return UniteRepository.findById(id, organizationId, client);
    }

    static async listLibreOptions(): Promise<UniteLibreOptionDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return UniteRepository.findAllLibreOptions(organizationId);
    }

    static async listAllOptions(): Promise<UniteOptionDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return UniteRepository.findAllOptions(organizationId);
    }

    static async updateMeuble(
        id: string,
        isMeuble: boolean,
        organizationId: string,
        client?: Prisma.TransactionClient
    ): Promise<void> {
        await UniteRepository.updateMeuble(id, isMeuble, organizationId, client);
    }

    static async updateEtat(
        id: string,
        etat: EtatUnite,
        organizationId: string,
        client?: Prisma.TransactionClient
    ): Promise<UniteDTO | null> {
        return UniteRepository.updateEtat(id, etat, organizationId, client);
    }
}
