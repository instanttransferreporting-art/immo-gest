import { RoleType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/features/auth/services/auth.service";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import type { OrganizationFormValues } from "@/features/organizations/schemas/organization.schema";
import { PlatformRepository } from "@/features/platform/repositories/platform.repository";
import type { CreateOrganizationFormValues } from "@/features/platform/schemas/platform.schema";
import type { OrganizationSummaryDTO, PlatformStatsDTO } from "@/features/platform/types/platform.types";

export class OrganizationNotFoundError extends Error {
    constructor() {
        super("L'entreprise est introuvable.");
        this.name = "OrganizationNotFoundError";
    }
}

export class OrganizationSuspendedError extends Error {
    constructor() {
        super("Cette entreprise est suspendue.");
        this.name = "OrganizationSuspendedError";
    }
}

export class PlatformService {
    static async getStats(): Promise<PlatformStatsDTO> {
        const [totalOrganizations, totalImmeubles, totalUnites, totalUsers] = await Promise.all([
            PlatformRepository.countOrganizations(),
            PlatformRepository.countImmeubles(),
            PlatformRepository.countUnites(),
            PlatformRepository.countUsers(),
        ]);

        return { totalOrganizations, totalImmeubles, totalUnites, totalUsers };
    }

    static async listOrganizations(): Promise<OrganizationSummaryDTO[]> {
        const organizations = await PlatformRepository.findAllOrganizations();

        return organizations.map((organization) => ({
            id: organization.id,
            nom: organization.nom,
            logo: organization.logo,
            tauxCommissionDefaut: organization.tauxCommissionDefaut,
            tauxPenaliteRetard: organization.tauxPenaliteRetard,
            adresse: organization.adresse,
            ville: organization.ville,
            telephone: organization.telephone,
            email: organization.email,
            createdAt: organization.createdAt,
            totalImmeubles: organization._count.immeubles,
            totalUsers: organization._count.users,
            isActive: organization.isActive,
        }));
    }

    static async createOrganization(input: CreateOrganizationFormValues): Promise<OrganizationSummaryDTO> {
        return prisma.$transaction(
            async (tx) => {
                const organization = await PlatformRepository.createOrganization(
                    { nom: input.nom, tauxCommissionDefaut: input.tauxCommissionDefaut },
                    tx
                );

                await AuthService.register(
                    {
                        organizationId: organization.id,
                        nom: input.adminNom,
                        prenom: input.adminPrenom,
                        email: input.adminEmail,
                        password: input.adminPassword,
                        role: RoleType.ADMIN,
                    },
                    tx
                );

                return {
                    id: organization.id,
                    nom: organization.nom,
                    logo: null,
                    tauxCommissionDefaut: input.tauxCommissionDefaut,
                    tauxPenaliteRetard: 5,
                    adresse: null,
                    ville: organization.ville,
                    telephone: null,
                    email: null,
                    createdAt: organization.createdAt,
                    totalImmeubles: 0,
                    totalUsers: 1,
                    isActive: true,
                };
            },
            { maxWait: 10_000, timeout: 15_000 }
        );
    }

    static async updateOrganization(organizationId: string, data: OrganizationFormValues) {
        const organization = await OrganizationService.getById(organizationId);

        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        return OrganizationService.updateById(organizationId, data);
    }

    static async setOrganizationActive(organizationId: string, isActive: boolean) {
        const organization = await OrganizationService.getById(organizationId);

        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        return OrganizationService.setActive(organizationId, isActive);
    }

    static async startImpersonation(organizationId: string): Promise<{ id: string; nom: string }> {
        const organization = await OrganizationService.getById(organizationId);

        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        if (!organization.isActive) {
            throw new OrganizationSuspendedError();
        }

        return { id: organization.id, nom: organization.nom };
    }
}
