"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId, UnauthenticatedError } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { TypeDocumentContrat } from "@/generated/prisma/enums";
import {
    DocumentContratNotFoundError,
    DocumentContratService,
} from "@/features/leases/services/document-contrat.service";
import { TYPE_DOCUMENT_CONTRAT_LABELS } from "@/features/leases/constants/document-contrat.constants";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { DocumentContratDTO } from "@/features/leases/types/document-contrat.types";

const VALID_TYPES: readonly string[] = Object.values(TypeDocumentContrat);

export async function uploadDocumentContrat(formData: FormData): Promise<ActionResponse<DocumentContratDTO>> {
    let user;

    try {
        user = await checkPermission("DOCUMENT_UPLOAD");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    const contratId = formData.get("contratId");
    const type = formData.get("type");
    const file = formData.get("file");

    if (typeof contratId !== "string" || !contratId) {
        return { success: false, message: "Le contrat est requis." };
    }

    if (typeof type !== "string" || !VALID_TYPES.includes(type)) {
        return { success: false, message: "Le type de document est invalide." };
    }

    if (!(file instanceof File) || file.size === 0) {
        return { success: false, message: "Veuillez sélectionner un fichier." };
    }

    try {
        const document = await DocumentContratService.upload(contratId, type as TypeDocumentContrat, file);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_DOCUMENT_UPLOAD",
            details: `${TYPE_DOCUMENT_CONTRAT_LABELS[document.type]} téléversé (${document.nomFichier}).`,
        });

        revalidatePath(`${ROUTES.LEASES}/${contratId}`);

        return { success: true, message: "Document téléversé avec succès.", data: document };
    } catch (error) {
        // Inclut les erreurs de stockage (ex : Supabase non configuré), affichées telles quelles.
        return {
            success: false,
            message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload.",
        };
    }
}

export async function getDocumentContratUrl(documentId: string): Promise<ActionResponse<string>> {
    try {
        await checkPermission("DOCUMENT_UPLOAD");
    } catch (error) {
        if (error instanceof UnauthenticatedError || error instanceof ForbiddenError) {
            return { success: false, message: error.message };
        }

        throw error;
    }

    try {
        const url = await DocumentContratService.getDownloadUrl(documentId);
        return { success: true, message: "Lien généré.", data: url };
    } catch (error) {
        if (error instanceof DocumentContratNotFoundError) {
            return { success: false, message: error.message };
        }

        return { success: false, message: error instanceof Error ? error.message : "Une erreur est survenue." };
    }
}
