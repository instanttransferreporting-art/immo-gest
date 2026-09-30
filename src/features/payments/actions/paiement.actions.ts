"use server";

import { revalidatePath } from "next/cache";

import type { Session } from "next-auth";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import {
    InsufficientBalanceError,
    PaiementDejaAnnuleError,
    PaiementNotFoundError,
    PaiementService,
} from "@/features/payments/services/paiement.service";
import { FactureNotFoundError } from "@/features/invoices/services/facture.service";
import { annulerPaiementSchema, paiementSchema } from "@/features/payments/schemas/payment.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

export async function createPaiement(input: unknown): Promise<ActionResponse<PaiementDTO>> {
    let user: Session["user"];

    try {
        user = await checkPermission("PAIEMENT_CREATE");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = paiementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const paiement = await PaiementService.create(parsed.data, user.id);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "PAIEMENT_CREATE",
            details: `Paiement de ${paiement.montant} FCFA enregistré (facture ${parsed.data.factureId}).`,
        });

        revalidatePath(`${ROUTES.INVOICES}/${parsed.data.factureId}`);
        revalidatePath(ROUTES.INVOICES);
        revalidatePath(ROUTES.RECOUVREMENT);

        return {
            success: true,
            message: "Paiement enregistré avec succès.",
            data: paiement,
        };
    } catch (error) {
        if (error instanceof InsufficientBalanceError) {
            return {
                success: false,
                message: error.message,
                errors: { montant: [error.message] },
            };
        }

        if (error instanceof FactureNotFoundError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de l'enregistrement du paiement.",
        };
    }
}

export async function annulerPaiement(input: unknown): Promise<ActionResponse<PaiementDTO>> {
    let user: Session["user"];

    try {
        user = await checkPermission("PAIEMENT_ANNULER");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const parsed = annulerPaiementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const paiement = await PaiementService.annuler(parsed.data.paiementId, parsed.data.motif, user.id);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "PAIEMENT_ANNULER",
            details: `Paiement de ${paiement.montant} FCFA annulé — motif : ${parsed.data.motif}`,
        });

        revalidatePath(`${ROUTES.INVOICES}/${paiement.factureId}`);
        revalidatePath(ROUTES.INVOICES);
        revalidatePath(ROUTES.RECOUVREMENT);

        return {
            success: true,
            message: "Paiement annulé avec succès.",
            data: paiement,
        };
    } catch (error) {
        if (error instanceof PaiementNotFoundError || error instanceof PaiementDejaAnnuleError) {
            return { success: false, message: error.message };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de l'annulation du paiement.",
        };
    }
}
