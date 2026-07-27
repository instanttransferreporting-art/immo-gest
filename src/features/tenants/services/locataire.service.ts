import { LocataireRepository } from "@/features/tenants/repositories/locataire.repository";
import type { LocataireFormValues } from "@/features/tenants/schemas/tenant.schema";
import type { LocataireDTO, LocataireOptionDTO } from "@/features/tenants/types/tenant.types";

export class LocataireService {
    static async create(input: LocataireFormValues): Promise<LocataireDTO> {
        return LocataireRepository.create(input);
    }

    static async listAll(): Promise<LocataireDTO[]> {
        return LocataireRepository.findAll();
    }

    static async listOptions(): Promise<LocataireOptionDTO[]> {
        return LocataireRepository.findAllOptions();
    }
}
