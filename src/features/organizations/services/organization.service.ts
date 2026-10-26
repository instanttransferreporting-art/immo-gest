import { getCurrentOrganizationId } from "@/lib/auth";
import { deletePublicLogo, uploadPublicLogo } from "@/lib/storage";
import { OrganizationRepository } from "@/features/organizations/repositories/organization.repository";
import type { LogoKind, OrganizationFormValues } from "@/features/organizations/schemas/organization.schema";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";

const LOGO_FIELDS = { sidebar: "logo", document: "logoDocument" } as const satisfies Record<LogoKind, string>;

function deleteLogoInBackground(publicUrl: string | null): void {
    if (!publicUrl) {
        return;
    }

    void deletePublicLogo(publicUrl).catch((error) => {
        console.error("[logo] Échec de la suppression de l'ancien logo", error);
    });
}

const LOGO_EXTENSIONS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

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

    /**
     * Remplace un des logos de l'entreprise. Le nom de fichier est horodaté pour que
     * les navigateurs et clients mail ne servent pas l'ancienne version en cache.
     */
    static async updateLogo(id: string, kind: LogoKind, file: File): Promise<OrganizationDTO> {
        const previous = await OrganizationRepository.findById(id);

        if (!previous) {
            throw new OrganizationNotFoundError();
        }

        const field = LOGO_FIELDS[kind];
        const extension = LOGO_EXTENSIONS[file.type] ?? "png";
        const publicUrl = await uploadPublicLogo(`${id}/${kind}-${Date.now()}.${extension}`, file);
        const organization = await OrganizationRepository.setLogo(id, field, publicUrl);

        deleteLogoInBackground(previous[field]);

        return organization;
    }

    static async removeLogo(id: string, kind: LogoKind): Promise<OrganizationDTO> {
        const previous = await OrganizationRepository.findById(id);

        if (!previous) {
            throw new OrganizationNotFoundError();
        }

        const field = LOGO_FIELDS[kind];
        const organization = await OrganizationRepository.setLogo(id, field, null);

        deleteLogoInBackground(previous[field]);

        return organization;
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
