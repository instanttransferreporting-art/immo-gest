import type { StatutIncident } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { IncidentRepository } from "@/features/incidents/repositories/incident.repository";
import type { IncidentFormValues } from "@/features/incidents/schemas/incident.schema";
import type { IncidentDTO } from "@/features/incidents/types/incident.types";

export class IncidentNotFoundError extends Error {
    constructor() {
        super("L'incident est introuvable.");
        this.name = "IncidentNotFoundError";
    }
}

export class IncidentService {
    static async create(input: IncidentFormValues): Promise<IncidentDTO> {
        const organizationId = await getCurrentOrganizationId();
        return IncidentRepository.create(organizationId, input);
    }

    static async listAll(): Promise<IncidentDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return IncidentRepository.findAll(organizationId);
    }

    static async updateStatut(id: string, statut: StatutIncident): Promise<IncidentDTO> {
        const organizationId = await getCurrentOrganizationId();
        const incident = await IncidentRepository.updateStatut(id, organizationId, statut);

        if (!incident) {
            throw new IncidentNotFoundError();
        }

        return incident;
    }

    static async assignPrestataire(id: string, prestataire: string): Promise<IncidentDTO> {
        const organizationId = await getCurrentOrganizationId();
        const incident = await IncidentRepository.updatePrestataire(id, organizationId, prestataire);

        if (!incident) {
            throw new IncidentNotFoundError();
        }

        return incident;
    }
}
