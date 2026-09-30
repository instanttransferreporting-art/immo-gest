import { getCurrentOrganizationId } from "@/lib/auth";
import { AuditRepository } from "@/features/audit/repositories/audit.repository";
import type { AuditLogDTO } from "@/features/audit/types/audit.types";

export class AuditQueryService {
    static async list(): Promise<AuditLogDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return AuditRepository.findAll(organizationId);
    }
}
