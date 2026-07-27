"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { getCurrentSession } from "@/lib/auth";
import { LocataireService } from "@/features/tenants/services/locataire.service";
import { locataireSchema } from "@/features/tenants/schemas/tenant.schema";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export async function createLocataire(input: unknown): Promise<ActionResponse<LocataireDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const parsed = locataireSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Les informations saisies sont invalides.",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    try {
        const locataire = await LocataireService.create(parsed.data);

        revalidatePath(ROUTES.TENANTS);

        return {
            success: true,
            message: "Locataire créé avec succès.",
            data: locataire,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
            return {
                success: false,
                message: "Cet email est déjà utilisé par un autre locataire.",
                errors: { email: ["Cet email est déjà utilisé."] },
            };
        }

        return {
            success: false,
            message: "Une erreur est survenue lors de la création du locataire.",
        };
    }
}
