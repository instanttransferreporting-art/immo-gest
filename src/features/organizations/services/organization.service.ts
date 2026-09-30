import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationRepository } from "@/features/organizations/repositories/organization.repository";
import type { OrganizationFormValues } from "@/features/organizations/schemas/organization.schema";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";

export class OrganizationNotFoundError extends Error {
    constructor() {
        super("L'organisation est introuvable.");
        this.name = "OrganizationNotFoundError";
    }
}

export class OrganizationService {
    static async getCurrent(): Promise<OrganizationDTO> {
        const organizationId = await getCurrentOrganizationId();
        const organization = await OrganizationRepository.findById(organizationId);

        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        return organization;
    }

    static async update(data: OrganizationFormValues): Promise<OrganizationDTO> {
        const organizationId = await getCurrentOrganizationId();
        return OrganizationRepository.update(organizationId, data);
    }

    /**
     * Platform-level lookup by explicit id — used outside any org session
     * context (SUPER_ADMIN tooling, impersonation validation in lib/auth.ts).
     */
    static async getById(id: string): Promise<OrganizationDTO | null> {
        return OrganizationRepository.findById(id);
    }

    static async updateById(id: string, data: OrganizationFormValues): Promise<OrganizationDTO> {
        return OrganizationRepository.update(id, data);
    }

    static async setActive(id: string, isActive: boolean): Promise<OrganizationDTO> {
        return OrganizationRepository.setActive(id, isActive);
    }

    /**
     * Liste tous les id d'organisations actives — pour les tâches planifiées
     * (LOT-17) qui doivent itérer sur l'ensemble de la plateforme.
     */
    static async listAllActiveIds(): Promise<string[]> {
        const organizations = await OrganizationRepository.findAllActiveIds();
        return organizations.map((organization) => organization.id);
    }
}
