import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { buildFileResponse } from "@/lib/file-response";
import { contratDocumentRequestSchema } from "@/features/leases/schemas/contrat-document.schema";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import { ContratDocumentService } from "@/features/leases/services/contrat-document.service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session) {
        return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });
    }

    const parsed = contratDocumentRequestSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json({ error: "Les informations saisies sont invalides." }, { status: 400 });
    }

    try {
        const { values, index, format } = parsed.data;
        const { buffer, filename, contentType } = await ContratDocumentService.generate(id, values, index, format);

        return buildFileResponse(buffer, filename, contentType);
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        console.error("[contrat-document]", error);
        return NextResponse.json({ error: "Impossible de générer le contrat." }, { status: 500 });
    }
}
