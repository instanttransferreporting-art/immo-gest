import ExcelJS from "exceljs";

import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { getI18n } from "@/i18n/server";

export class ParcExportService {
    static async generate(): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();

        const [organization, contrats, { t, f }] = await Promise.all([
            OrganizationService.getCurrent(),
            ContratRepository.findAllActiveForExport(organizationId),
            getI18n(),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = organization.nom;
        workbook.created = new Date();

        const sheet = workbook.addWorksheet(t.reports.excel.parcSheet);

        sheet.mergeCells("A1:M1");
        sheet.getCell("A1").value = `${organization.nom} — ${t.reports.excel.parcTitle}`;
        sheet.getCell("A1").font = { bold: true, size: 14 };

        sheet.mergeCells("A2:M2");
        sheet.getCell("A2").value = t.reports.excel.parcSubtitle(f.dateShort(new Date()), contrats.length);
        sheet.getCell("A2").font = { size: 10, color: { argb: "FF64748B" } };

        sheet.addRow([]);

        const columns = [
            { header: t.reports.excel.columns.leaseNumber, key: "numeroContrat", width: 20 },
            { header: t.reports.excel.columns.building, key: "immeuble", width: 24 },
            { header: t.reports.excel.columns.address, key: "adresse", width: 28 },
            { header: t.reports.excel.columns.city, key: "ville", width: 16 },
            { header: t.reports.excel.columns.unit, key: "unite", width: 12 },
            { header: t.reports.excel.columns.type, key: "type", width: 14 },
            { header: t.reports.excel.columns.owner, key: "proprietaire", width: 24 },
            { header: t.reports.excel.columns.tenant, key: "locataire", width: 28 },
            { header: t.reports.excel.columns.phone, key: "telephone", width: 16 },
            { header: t.reports.excel.columns.email, key: "email", width: 26 },
            { header: t.reports.excel.columns.idDocument, key: "pieceIdentite", width: 20 },
            { header: t.reports.excel.columns.monthlyRent, key: "loyer", width: 16 },
            { header: t.reports.excel.columns.charges, key: "charges", width: 14 },
            { header: t.reports.excel.columns.securityDeposit, key: "depotGarantie", width: 16 },
            { header: t.reports.excel.columns.frequency, key: "frequence", width: 14 },
            { header: t.reports.excel.columns.startDate, key: "dateDebut", width: 14 },
            { header: t.reports.excel.columns.endDate, key: "dateFin", width: 14 },
        ];

        const headerRowIndex = 4;
        sheet.getRow(headerRowIndex).values = columns.map((column) => column.header);
        sheet.getRow(headerRowIndex).font = { bold: true };
        sheet.getRow(headerRowIndex).eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        });

        sheet.columns = columns.map(({ key, width }) => ({ key, width }));

        for (const contrat of contrats) {
            const locataireNom =
                contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`;
            const proprietaireNom =
                `${contrat.unite.immeuble.proprietaire.nom} ${contrat.unite.immeuble.proprietaire.prenom ?? ""}`.trim();

            const row = sheet.addRow({
                numeroContrat: contrat.numeroContrat,
                immeuble: contrat.unite.immeuble.nom,
                adresse: contrat.unite.immeuble.adresse,
                ville: contrat.unite.immeuble.ville,
                unite: contrat.unite.numero,
                type: t.enums.typeUnite[contrat.unite.type],
                proprietaire: proprietaireNom,
                locataire: locataireNom,
                telephone: contrat.locataire.telephone,
                email: contrat.locataire.email,
                pieceIdentite: contrat.locataire.pieceIdentite,
                loyer: contrat.loyerBase,
                charges: contrat.charges,
                depotGarantie: contrat.depotGarantie,
                frequence: t.enums.frequenceEcheance[contrat.frequence],
                dateDebut: contrat.dateDebut,
                dateFin: contrat.dateFin,
            });

            row.getCell("loyer").numFmt = "#,##0";
            row.getCell("charges").numFmt = "#,##0";
            row.getCell("depotGarantie").numFmt = "#,##0";
            row.getCell("dateDebut").numFmt = "dd/mm/yyyy";
            row.getCell("dateFin").numFmt = "dd/mm/yyyy";
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "_");
        const filename = `${t.reports.excel.parcFilename}_${dateSegment}.xlsx`;

        return { buffer: Buffer.from(buffer), filename };
    }
}
