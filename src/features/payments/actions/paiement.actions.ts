"use server";

import { revalidatePath } from "next/cache";

import type { Session } from "next-auth";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
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
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

export async function createPaiement(input: unknown): Promise<ActionResponse<PaiementDTO>> {
    const { t } = await getI18n();

    let user: Session["user"];

    try {
        user = await checkPermission("PAIEMENT_CREATE");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = paiementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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
            message: t.payments.messages.recorded,
            data: paiement,
        };
    } catch (error) {
        if (error instanceof InsufficientBalanceError) {
            return {
                success: false,
                message: t.payments.errors.exceedsBalance,
                errors: { montant: [t.payments.errors.exceedsBalance] },
            };
        }

        if (error instanceof FactureNotFoundError) {
            return { success: false, message: t.invoices.errors.notFound };
        }

        return {
            success: false,
            message: t.payments.messages.recordFailed,
        };
    }
}

export async function annulerPaiement(input: unknown): Promise<ActionResponse<PaiementDTO>> {
    const { t } = await getI18n();

    let user: Session["user"];

    try {
        user = await checkPermission("PAIEMENT_ANNULER");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const parsed = annulerPaiementSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: t.common.invalidInput,
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
            message: t.payments.messages.cancelled,
            data: paiement,
        };
    } catch (error) {
        if (error instanceof PaiementNotFoundError) {
            return { success: false, message: t.payments.errors.notFound };
        }

        if (error instanceof PaiementDejaAnnuleError) {
            return { success: false, message: t.payments.errors.alreadyCancelled };
        }

        return {
            success: false,
            message: t.payments.messages.cancelFailed,
        };
    }
}
