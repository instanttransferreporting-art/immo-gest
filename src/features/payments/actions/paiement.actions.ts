"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { InsufficientBalanceError, PaiementService } from "@/features/payments/services/paiement.service";
import { FactureNotFoundError } from "@/features/invoices/services/facture.service";
import { paiementSchema } from "@/features/payments/schemas/payment.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { PaiementDTO } from "@/features/payments/types/payment.types";

export async function createPaiement(input: unknown): Promise<ActionResponse<PaiementDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
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
        const paiement = await PaiementService.create(parsed.data, session.user.id);

        revalidatePath(`${ROUTES.INVOICES}/${parsed.data.factureId}`);
        revalidatePath(ROUTES.INVOICES);

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
