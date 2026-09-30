import { getCurrentOrganizationId } from "@/lib/auth";
import { LocataireRepository } from "@/features/tenants/repositories/locataire.repository";
import type { LocataireFormValues } from "@/features/tenants/schemas/tenant.schema";
import type { LocataireDTO, LocataireOptionDTO } from "@/features/tenants/types/tenant.types";

export class LocataireService {
    static async create(input: LocataireFormValues): Promise<LocataireDTO> {
        const organizationId = await getCurrentOrganizationId();
        return LocataireRepository.create(organizationId, input);
    }

    static async update(id: string, input: LocataireFormValues): Promise<LocataireDTO | null> {
        const organizationId = await getCurrentOrganizationId();
        return LocataireRepository.update(id, organizationId, input);
    }

    static async listAll(): Promise<LocataireDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return LocataireRepository.findAll(organizationId);
    }

    static async listOptions(): Promise<LocataireOptionDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return LocataireRepository.findAllOptions(organizationId);
    }
}
