import type { Prisma } from "@/generated/prisma/client";
import { StatutCaution } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { CautionRepository } from "@/features/leases/repositories/caution.repository";
import type { RestitutionCautionFormValues } from "@/features/leases/schemas/caution.schema";
import type { CautionDTO } from "@/features/leases/types/caution.types";

export class CautionNotFoundError extends Error {
    constructor() {
        super("La caution est introuvable.");
        this.name = "CautionNotFoundError";
    }
}

export class CautionExceedsMontantInitialError extends Error {
    constructor() {
        super("Le montant rendu et retenu ne peut pas dépasser le montant initial de la caution.");
        this.name = "CautionExceedsMontantInitialError";
    }
}

function deriveStatut(montantInitial: number, montantRendu: number, montantRetenu: number): StatutCaution {
    const totalTraite = montantRendu + montantRetenu;

    if (totalTraite === 0) {
        return StatutCaution.EN_COURS;
    }

    if (montantRendu === montantInitial && montantRetenu === 0) {
        return StatutCaution.RESTITUEE_TOTALE;
    }

    if (montantRetenu === montantInitial && montantRendu === 0) {
        return StatutCaution.RETENUE_TRAVAUX;
    }

    return StatutCaution.RESTITUEE_PARTIELLE;
}

export class CautionService {
    static async createForContrat(
        organizationId: string,
        contratId: string,
        montantInitial: number,
        client: Prisma.TransactionClient
    ): Promise<CautionDTO> {
        return CautionRepository.create(organizationId, { contratId, montantInitial }, client);
    }

    static async getByContrat(contratId: string): Promise<CautionDTO | null> {
        const organizationId = await getCurrentOrganizationId();
        return CautionRepository.findByContrat(contratId, organizationId);
    }

    static async restituer(input: RestitutionCautionFormValues): Promise<CautionDTO> {
        const organizationId = await getCurrentOrganizationId();

        return prisma.$transaction(
            async (tx) => {
                const caution = await CautionRepository.findById(input.cautionId, organizationId, tx);

                if (!caution) {
                    throw new CautionNotFoundError();
                }

                if (input.montantRendu + input.montantRetenu > caution.montantInitial) {
                    throw new CautionExceedsMontantInitialError();
                }

                const statut = deriveStatut(caution.montantInitial, input.montantRendu, input.montantRetenu);

                const updated = await CautionRepository.updateRestitution(
                    input.cautionId,
                    organizationId,
                    {
                        montantRendu: input.montantRendu,
                        montantRetenu: input.montantRetenu,
                        statut,
                        notes: input.notes,
                    },
                    tx
                );

                if (!updated) {
                    throw new CautionNotFoundError();
                }

                return updated;
            },
            { maxWait: 10_000, timeout: 15_000 }
        );
    }
}
