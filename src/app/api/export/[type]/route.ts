import { NextResponse, type NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { checkPermission, ForbiddenError } from "@/lib/permissions";
import { buildFileResponse } from "@/lib/file-response";
import { FactureNotFoundError } from "@/features/invoices/services/facture.service";
import { QuittanceExportService } from "@/features/invoices/services/quittance-export.service";
import { ContratExportService } from "@/features/leases/services/contrat-export.service";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import { ParcExportService } from "@/features/leases/services/parc-export.service";
import { ReversementExportService } from "@/features/payouts/services/reversement-export.service";
import { ProprietaireNotFoundError } from "@/features/payouts/services/reversement.service";
import { ReportExportService } from "@/features/reports/services/report-export.service";
import { REPORT_DEFINITIONS } from "@/features/reports/constants/report.constants";
import type { ReportType } from "@/features/reports/types/report.types";

type RouteParams = { params: Promise<{ type: string }> };

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { type } = await params;
    const session = await getCurrentSession();

    if (!session) {
        return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    try {
        switch (type) {
            case "quittance": {
                const factureId = searchParams.get("factureId");

                if (!factureId) {
                    return NextResponse.json({ error: "Le paramètre factureId est requis." }, { status: 400 });
                }

                const { buffer, filename } = await QuittanceExportService.generate(factureId);
                return buildFileResponse(buffer, filename, "application/pdf");
            }

            case "contrat": {
                const contratId = searchParams.get("contratId");

                if (!contratId) {
                    return NextResponse.json({ error: "Le paramètre contratId est requis." }, { status: 400 });
                }

                const { buffer, filename } = await ContratExportService.generate(contratId);
                return buildFileResponse(buffer, filename, "application/pdf");
            }

            case "reversement": {
                await checkPermission("REVERSEMENT_EXPORT");

                const reversementId = searchParams.get("reversementId");

                if (!reversementId) {
                    return NextResponse.json({ error: "Le paramètre reversementId est requis." }, { status: 400 });
                }

                const { buffer, filename } = await ReversementExportService.generate(reversementId);
                return buildFileResponse(
                    buffer,
                    filename,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
            }

            case "parc": {
                await checkPermission("PARC_EXPORT");

                const { buffer, filename } = await ParcExportService.generate();
                return buildFileResponse(
                    buffer,
                    filename,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
            }

            case "rapport": {
                await checkPermission("RAPPORTS_VIEW");

                const reportType = searchParams.get("reportType");
                const isValidReportType = REPORT_DEFINITIONS.some((definition) => definition.type === reportType);

                if (!reportType || !isValidReportType) {
                    return NextResponse.json({ error: "Le paramètre reportType est invalide." }, { status: 400 });
                }

                const { buffer, filename } = await ReportExportService.generate(reportType as ReportType);
                return buildFileResponse(
                    buffer,
                    filename,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
            }

            default:
                return NextResponse.json({ error: "Type d'export inconnu." }, { status: 404 });
        }
    } catch (error) {
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        if (
            error instanceof FactureNotFoundError ||
            error instanceof ContratNotFoundError ||
            error instanceof ProprietaireNotFoundError
        ) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        console.error(`[export] Échec de la génération (type=${type})`, error);
        return NextResponse.json({ error: "Une erreur est survenue lors de la génération du fichier." }, { status: 500 });
    }
}
