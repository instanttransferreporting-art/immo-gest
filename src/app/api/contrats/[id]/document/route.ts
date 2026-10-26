import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { buildFileResponse } from "@/lib/file-response";
import { contratDocumentRequestSchema } from "@/features/leases/schemas/contrat-document.schema";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import { ContratDocumentService } from "@/features/leases/services/contrat-document.service";
import { getI18n } from "@/i18n/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    const [session, { t }] = await Promise.all([getCurrentSession(), getI18n()]);

    if (!session) {
        return NextResponse.json({ error: t.common.errors.unauthenticated }, { status: 401 });
    }

    const parsed = contratDocumentRequestSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json({ error: t.common.invalidInput }, { status: 400 });
    }

    try {
        const { values, index, format } = parsed.data;
        const { buffer, filename, contentType } = await ContratDocumentService.generate(id, values, index, format);

        return buildFileResponse(buffer, filename, contentType);
    } catch (error) {
        if (error instanceof ContratNotFoundError) {
            return NextResponse.json({ error: t.leases.errors.notFound }, { status: 404 });
        }

        console.error("[contrat-document]", error);
        return NextResponse.json({ error: t.leases.generate.failed }, { status: 500 });
    }
}
