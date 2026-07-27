import { ProprietaireRepository } from "@/features/properties/repositories/proprietaire.repository";
import type { ProprietaireFormValues } from "@/features/properties/schemas/property.schema";
import type { ProprietaireDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";

function withPrimaryPhone(data: ProprietaireFormValues): ProprietaireFormValues {
    const hasPrincipal = data.telephones.some((telephone) => telephone.estPrincipal);

    if (hasPrincipal || data.telephones.length === 0) {
        return data;
    }

    return {
        ...data,
        telephones: data.telephones.map((telephone, index) => ({
            ...telephone,
            estPrincipal: index === 0,
        })),
    };
}

export class ProprietaireService {
    static async create(input: ProprietaireFormValues): Promise<ProprietaireDTO> {
        return ProprietaireRepository.create(withPrimaryPhone(input));
    }

    static async listAll(): Promise<ProprietaireDTO[]> {
        return ProprietaireRepository.findAll();
    }

    static async listOptions(): Promise<ProprietaireOptionDTO[]> {
        return ProprietaireRepository.findAllOptions();
    }

    static async getById(id: string): Promise<ProprietaireDTO | null> {
        return ProprietaireRepository.findById(id);
    }
}
