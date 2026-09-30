import ExcelJS from "exceljs";

import { StatutBail } from "@/generated/prisma/enums";
import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { LocataireRepository } from "@/features/tenants/repositories/locataire.repository";
import { UniteRepository } from "@/features/units/repositories/unite.repository";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { FactureRepository } from "@/features/invoices/repositories/facture.repository";
import { PaiementRepository } from "@/features/payments/repositories/paiement.repository";
import { CautionRepository } from "@/features/leases/repositories/caution.repository";
import { TYPE_LOCATAIRE_LABELS } from "@/features/tenants/constants/tenant.constants";
import { TYPE_UNITE_LABELS, ETAT_UNITE_LABELS } from "@/features/units/constants/unit.constants";
import { FREQUENCE_LABELS, STATUT_BAIL_LABELS } from "@/features/leases/constants/lease.constants";
import { MODE_PAIEMENT_LABELS } from "@/features/payments/constants/payment.constants";
import { STATUT_CAUTION_LABELS } from "@/features/leases/constants/caution.constants";
import { REPORT_DEFINITIONS } from "@/features/reports/constants/report.constants";
import type { ReportType } from "@/features/reports/types/report.types";

const EXPIRED_STATUTS: StatutBail[] = [StatutBail.RESILIE, StatutBail.EXPIRE];

type Column = { header: string; key: string; width: number };

async function buildWorkbook(
    title: string,
    columns: Column[],
    rows: Record<string, unknown>[],
    numericKeys: string[] = [],
    dateKeys: string[] = []
): Promise<ExcelJS.Workbook> {
    const organization = await OrganizationService.getCurrent();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = organization.nom;
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(title.slice(0, 31));
    const lastColumnLetter = String.fromCharCode(65 + columns.length - 1);

    sheet.mergeCells(`A1:${lastColumnLetter}1`);
    sheet.getCell("A1").value = `${organization.nom} — ${title}`;
    sheet.getCell("A1").font = { bold: true, size: 14 };

    const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
    sheet.mergeCells(`A2:${lastColumnLetter}2`);
    sheet.getCell("A2").value = `Exporté le ${dateFormatter.format(new Date())} — ${rows.length} ligne(s)`;
    sheet.getCell("A2").font = { size: 10, color: { argb: "FF64748B" } };

    sheet.addRow([]);

    const headerRowIndex = 4;
    sheet.getRow(headerRowIndex).values = columns.map((column) => column.header);
    sheet.getRow(headerRowIndex).font = { bold: true };
    sheet.getRow(headerRowIndex).eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    });

    sheet.columns = columns.map(({ key, width }) => ({ key, width }));

    for (const row of rows) {
        const addedRow = sheet.addRow(row);

        for (const key of numericKeys) {
            addedRow.getCell(key).numFmt = "#,##0";
        }

        for (const key of dateKeys) {
            addedRow.getCell(key).numFmt = "dd/mm/yyyy";
        }
    }

    return workbook;
}

function locataireNom(locataire: { nom: string; prenom: string; raisonSociale: string | null }): string {
    return locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`;
}

async function buildLocataires(organizationId: string) {
    const locataires = await LocataireRepository.findAll(organizationId);

    return buildWorkbook(
        "Locataires",
        [
            { header: "Type", key: "type", width: 14 },
            { header: "Nom", key: "nom", width: 24 },
            { header: "Téléphone", key: "telephone", width: 16 },
            { header: "Email", key: "email", width: 26 },
            { header: "Pièce d'identité", key: "pieceIdentite", width: 20 },
            { header: "Adresse", key: "adresse", width: 30 },
        ],
        locataires.map((locataire) => ({
            type: TYPE_LOCATAIRE_LABELS[locataire.type],
            nom: locataireNom(locataire),
            telephone: locataire.telephone,
            email: locataire.email,
            pieceIdentite: locataire.pieceIdentite,
            adresse: locataire.adresse,
        }))
    );
}

async function buildBiens(organizationId: string) {
    const unites = await UniteRepository.findAllForExport(organizationId);

    return buildWorkbook(
        "Biens",
        [
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Ville", key: "ville", width: 16 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Type", key: "type", width: 14 },
            { header: "Surface (m²)", key: "surface", width: 14 },
            { header: "Pièces", key: "pieces", width: 10 },
            { header: "Loyer mensuel", key: "loyer", width: 16 },
            { header: "Caution", key: "caution", width: 16 },
            { header: "État", key: "etat", width: 14 },
        ],
        unites.map((unite) => ({
            immeuble: unite.immeuble.nom,
            ville: unite.immeuble.ville,
            unite: unite.numero,
            type: TYPE_UNITE_LABELS[unite.type],
            surface: unite.surface,
            pieces: unite.nombrePieces,
            loyer: unite.loyerMensuel,
            caution: unite.caution,
            etat: ETAT_UNITE_LABELS[unite.etat],
        })),
        ["loyer", "caution"]
    );
}

async function buildContrats(organizationId: string, statuts: StatutBail[], title: string) {
    const contrats = await ContratRepository.findByStatutsForExport(organizationId, statuts);

    return buildWorkbook(
        title,
        [
            { header: "N° Contrat", key: "numeroContrat", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Loyer", key: "loyer", width: 14 },
            { header: "Fréquence", key: "frequence", width: 14 },
            { header: "Date début", key: "dateDebut", width: 14 },
            { header: "Date fin", key: "dateFin", width: 14 },
            { header: "Statut", key: "statut", width: 14 },
        ],
        contrats.map((contrat) => ({
            numeroContrat: contrat.numeroContrat,
            immeuble: contrat.unite.immeuble.nom,
            unite: contrat.unite.numero,
            locataire: locataireNom(contrat.locataire),
            loyer: contrat.loyerBase,
            frequence: FREQUENCE_LABELS[contrat.frequence],
            dateDebut: contrat.dateDebut,
            dateFin: contrat.dateFin,
            statut: STATUT_BAIL_LABELS[contrat.statut],
        })),
        ["loyer"],
        ["dateDebut", "dateFin"]
    );
}

async function buildLoyersFactures(organizationId: string) {
    const factures = await FactureRepository.findAll(organizationId);

    return buildWorkbook(
        "Loyers facturés",
        [
            { header: "N° Facture", key: "numero", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Échéance", key: "echeance", width: 14 },
            { header: "Montant", key: "montant", width: 16 },
            { header: "Pénalités", key: "penalites", width: 14 },
            { header: "Total dû", key: "totalDu", width: 16 },
            { header: "Soldée", key: "soldee", width: 12 },
        ],
        factures.map((facture) => ({
            numero: facture.numero,
            immeuble: facture.echeance.contrat.unite.immeuble.nom,
            unite: facture.echeance.contrat.unite.numero,
            locataire: locataireNom(facture.echeance.contrat.locataire),
            echeance: facture.echeance.dateEcheance,
            montant: facture.montant,
            penalites: facture.penalites,
            totalDu: facture.totalDu,
            soldee: facture.estSoldee ? "Oui" : "Non",
        })),
        ["montant", "penalites", "totalDu"],
        ["echeance"]
    );
}

async function buildLoyersEncaisses(organizationId: string) {
    const paiements = await PaiementRepository.findAllForExport(organizationId);

    return buildWorkbook(
        "Loyers encaissés",
        [
            { header: "Date", key: "date", width: 14 },
            { header: "N° Facture", key: "facture", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Mode", key: "mode", width: 18 },
            { header: "Référence", key: "reference", width: 20 },
            { header: "Montant", key: "montant", width: 16 },
            { header: "Enregistré par", key: "enregistrePar", width: 22 },
        ],
        paiements.map((paiement) => ({
            date: paiement.datePaiement,
            facture: paiement.facture.numero,
            immeuble: paiement.echeance.contrat.unite.immeuble.nom,
            unite: paiement.echeance.contrat.unite.numero,
            locataire: locataireNom(paiement.echeance.contrat.locataire),
            mode: MODE_PAIEMENT_LABELS[paiement.mode],
            reference: paiement.reference ?? "—",
            montant: paiement.montant,
            enregistrePar: `${paiement.enregistrePar.nom} ${paiement.enregistrePar.prenom}`,
        })),
        ["montant"],
        ["date"]
    );
}

async function buildImpayes(organizationId: string) {
    const factures = await FactureRepository.findImpayes(organizationId);

    return buildWorkbook(
        "Impayés",
        [
            { header: "N° Facture", key: "numero", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Échéance", key: "echeance", width: 14 },
            { header: "Total dû", key: "totalDu", width: 16 },
        ],
        factures.map((facture) => ({
            numero: facture.numero,
            immeuble: facture.echeance.contrat.unite.immeuble.nom,
            unite: facture.echeance.contrat.unite.numero,
            locataire: locataireNom(facture.echeance.contrat.locataire),
            echeance: facture.echeance.dateEcheance,
            totalDu: facture.totalDu,
        })),
        ["totalDu"],
        ["echeance"]
    );
}

async function buildCautions(organizationId: string) {
    const cautions = await CautionRepository.findAllForExport(organizationId);

    return buildWorkbook(
        "Cautions",
        [
            { header: "N° Contrat", key: "numeroContrat", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Montant initial", key: "montantInitial", width: 16 },
            { header: "Montant retenu", key: "montantRetenu", width: 16 },
            { header: "Montant rendu", key: "montantRendu", width: 16 },
            { header: "Statut", key: "statut", width: 20 },
        ],
        cautions.map((caution) => ({
            numeroContrat: caution.contrat.numeroContrat,
            immeuble: caution.contrat.unite.immeuble.nom,
            unite: caution.contrat.unite.numero,
            locataire: locataireNom(caution.contrat.locataire),
            montantInitial: caution.montantInitial,
            montantRetenu: caution.montantRetenu,
            montantRendu: caution.montantRendu,
            statut: STATUT_CAUTION_LABELS[caution.statut],
        })),
        ["montantInitial", "montantRetenu", "montantRendu"]
    );
}

async function buildCharges(organizationId: string) {
    const contrats = await ContratRepository.findByStatutsForExport(organizationId, [StatutBail.ACTIF]);

    return buildWorkbook(
        "Charges locatives",
        [
            { header: "N° Contrat", key: "numeroContrat", width: 20 },
            { header: "Immeuble", key: "immeuble", width: 24 },
            { header: "Unité", key: "unite", width: 12 },
            { header: "Locataire", key: "locataire", width: 28 },
            { header: "Charges mensuelles", key: "charges", width: 18 },
        ],
        contrats.map((contrat) => ({
            numeroContrat: contrat.numeroContrat,
            immeuble: contrat.unite.immeuble.nom,
            unite: contrat.unite.numero,
            locataire: locataireNom(contrat.locataire),
            charges: contrat.charges,
        })),
        ["charges"]
    );
}

function filenameFor(type: ReportType): string {
    const definition = REPORT_DEFINITIONS.find((item) => item.type === type);
    const slug = (definition?.label ?? type).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
    const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "_");
    return `${slug}_${dateSegment}.xlsx`;
}

export class ReportExportService {
    static async generate(type: ReportType): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();

        const workbook = await (async () => {
            switch (type) {
                case "locataires":
                    return buildLocataires(organizationId);
                case "biens":
                    return buildBiens(organizationId);
                case "contrats-actifs":
                    return buildContrats(organizationId, [StatutBail.ACTIF], "Contrats actifs");
                case "contrats-expires":
                    return buildContrats(organizationId, EXPIRED_STATUTS, "Contrats expirés");
                case "loyers-factures":
                    return buildLoyersFactures(organizationId);
                case "loyers-encaisses":
                    return buildLoyersEncaisses(organizationId);
                case "impayes":
                    return buildImpayes(organizationId);
                case "cautions":
                    return buildCautions(organizationId);
                case "charges":
                    return buildCharges(organizationId);
            }
        })();

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer: Buffer.from(buffer), filename: filenameFor(type) };
    }
}
