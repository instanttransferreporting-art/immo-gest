import ExcelJS from "exceljs";

import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { FREQUENCE_LABELS } from "@/features/leases/constants/lease.constants";
import { TYPE_UNITE_LABELS } from "@/features/units/constants/unit.constants";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" });

export class ParcExportService {
    static async generate(): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();

        const [organization, contrats] = await Promise.all([
            OrganizationService.getCurrent(),
            ContratRepository.findAllActiveForExport(organizationId),
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = organization.nom;
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Baux actifs");

        sheet.mergeCells("A1:M1");
        sheet.getCell("A1").value = `${organization.nom} — Parc locatif (baux actifs)`;
        sheet.getCell("A1").font = { bold: true, size: 14 };

        sheet.mergeCells("A2:M2");
        sheet.getCell("A2").value = `Exporté le ${dateFormatter.format(new Date())} — ${contrats.length} bail(aux) actif(s)`;
        sheet.getCell("A2").font = { size: 10, color: { argb: "FF64748B" } };

        sheet.addRow([]);

        const columns = [
            { header: "N° Contrat", key: "numeroContrat", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Adresse", key: "adresse", width: 28 },
            { header: "Ville", key: "ville", width: 16 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Type", key: "type", width: 14 },
            { header: "Propriétaire", key: "proprietaire", width: 24 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Téléphone", key: "telephone", width: 16 },
            { header: "Email", key: "email", width: 26 },
            { header: "Pièce d'identité", key: "pieceIdentite", width: 20 },
            { header: "Loyer mensuel", key: "loyer", width: 16 },
            { header: "Charges", key: "charges", width: 14 },
            { header: "Dépôt garantie", key: "depotGarantie", width: 16 },
            { header: "Fréquence", key: "frequence", width: 14 },
            { header: "Date début", key: "dateDebut", width: 14 },
            { header: "Date fin", key: "dateFin", width: 14 },
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
                type: TYPE_UNITE_LABELS[contrat.unite.type],
                proprietaire: proprietaireNom,
                locataire: locataireNom,
                telephone: contrat.locataire.telephone,
                email: contrat.locataire.email,
                pieceIdentite: contrat.locataire.pieceIdentite,
                loyer: contrat.loyerBase,
                charges: contrat.charges,
                depotGarantie: contrat.depotGarantie,
                frequence: FREQUENCE_LABELS[contrat.frequence],
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
        const filename = `Parc_Locatif_${dateSegment}.xlsx`;

        return { buffer: Buffer.from(buffer), filename };
    }
}
