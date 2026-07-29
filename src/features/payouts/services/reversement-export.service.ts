import ExcelJS from "exceljs";

import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ReversementRepository } from "@/features/payouts/repositories/reversement.repository";
import { ReversementNotFoundError } from "@/features/payouts/services/reversement.service";
import { STATUT_REVERSEMENT_LABELS } from "@/features/payouts/constants/payout.constants";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";

const DIACRITICS_PATTERN = new RegExp("[̀-ͯ]", "g");

function toFilenameSegment(value: string): string {
    return value
        .normalize("NFD")
        .replace(DIACRITICS_PATTERN, "")
        .replace(/\s+/g, "_");
}

function getMonthRange(mois: number, annee: number): { start: Date; end: Date } {
    return {
        start: new Date(annee, mois - 1, 1),
        end: new Date(annee, mois, 1),
    };
}

export class ReversementExportService {
    static async generate(reversementId: string): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();
        const reversement = await ReversementRepository.findById(reversementId, organizationId);

        if (!reversement) {
            throw new ReversementNotFoundError();
        }

        const { start, end } = getMonthRange(reversement.mois, reversement.annee);

        const [organization, lignes] = await Promise.all([
            OrganizationService.getCurrent(),
            ReversementRepository.findFacturesEncaisseesForProprietaireMonth(
                organizationId,
                reversement.proprietaireId,
                start,
                end
            ),
        ]);

        const proprietaireNom = `${reversement.proprietaire.nom} ${reversement.proprietaire.prenom ?? ""}`.trim();
        const periodeLabel = `${MOIS_LABELS[reversement.mois - 1]} ${reversement.annee}`;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = organization.nom;
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Reddition de comptes");

        sheet.mergeCells("A1:E1");
        sheet.getCell("A1").value = `${organization.nom} — Reddition de comptes`;
        sheet.getCell("A1").font = { bold: true, size: 14 };

        sheet.mergeCells("A2:E2");
        sheet.getCell("A2").value = `${proprietaireNom} — ${periodeLabel}`;
        sheet.getCell("A2").font = { size: 11, color: { argb: "FF64748B" } };

        sheet.addRow([]);

        const headerRowIndex = 4;
        sheet.getRow(headerRowIndex).values = ["N° Facture", "Locataire", "Unité", "Date d'échéance", "Montant encaissé"];
        sheet.getRow(headerRowIndex).font = { bold: true };
        sheet.getRow(headerRowIndex).eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        });

        sheet.columns = [
            { key: "numero", width: 20 },
            { key: "locataire", width: 28 },
            { key: "unite", width: 24 },
            { key: "dateEcheance", width: 16 },
            { key: "montant", width: 18 },
        ];

        for (const facture of lignes) {
            const locataireNom =
                facture.echeance.contrat.locataire.raisonSociale ??
                `${facture.echeance.contrat.locataire.nom} ${facture.echeance.contrat.locataire.prenom}`;
            const montantEncaisse = facture.totalDu - facture.echeance.soldeRestant;

            const row = sheet.addRow({
                numero: facture.numero,
                locataire: locataireNom,
                unite: `${facture.echeance.contrat.unite.immeuble.nom} — ${facture.echeance.contrat.unite.numero}`,
                dateEcheance: facture.echeance.dateEcheance,
                montant: montantEncaisse,
            });

            row.getCell("dateEcheance").numFmt = "dd/mm/yyyy";
            row.getCell("montant").numFmt = "#,##0";
        }

        sheet.addRow([]);

        const totalRow = sheet.addRow({ locataire: "Total encaissé", montant: reversement.totalEncaisse });
        totalRow.font = { bold: true };
        totalRow.getCell("montant").numFmt = "#,##0";

        const commissionRow = sheet.addRow({
            locataire: `Frais d'agence (${reversement.tauxCommission}%)`,
            montant: -reversement.commission,
        });
        commissionRow.getCell("montant").numFmt = "#,##0";

        const netRow = sheet.addRow({ locataire: "Net à payer au propriétaire", montant: reversement.netAPayer });
        netRow.font = { bold: true };
        netRow.getCell("montant").numFmt = "#,##0";

        sheet.addRow([]);
        sheet.addRow({ locataire: "Statut", montant: STATUT_REVERSEMENT_LABELS[reversement.statut] });

        const buffer = await workbook.xlsx.writeBuffer();
        const proprietaireSegment = toFilenameSegment(proprietaireNom);
        const moisSegment = toFilenameSegment(MOIS_LABELS[reversement.mois - 1]);
        const filename = `Reddition_Comptes_${proprietaireSegment}_${moisSegment}_${reversement.annee}.xlsx`;

        return { buffer: Buffer.from(buffer), filename };
    }
}
