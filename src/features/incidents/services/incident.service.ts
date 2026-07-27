import type { StatutIncident } from "@/generated/prisma/enums";
import { IncidentRepository } from "@/features/incidents/repositories/incident.repository";
import type { IncidentFormValues } from "@/features/incidents/schemas/incident.schema";
import type { IncidentDTO } from "@/features/incidents/types/incident.types";

export class IncidentService {
    static async create(input: IncidentFormValues): Promise<IncidentDTO> {
        return IncidentRepository.create(input);
    }

    static async listAll(): Promise<IncidentDTO[]> {
        return IncidentRepository.findAll();
    }

    static async updateStatut(id: string, statut: StatutIncident): Promise<IncidentDTO> {
        return IncidentRepository.updateStatut(id, statut);
    }

    static async assignPrestataire(id: string, prestataire: string): Promise<IncidentDTO> {
        return IncidentRepository.updatePrestataire(id, prestataire);
    }
}
