import { renderToBuffer } from "@react-pdf/renderer";

import { getCurrentOrganizationId } from "@/lib/auth";
import { FrequenceEcheance } from "@/generated/prisma/enums";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import {
    fillContratDocx,
    readContratParagraphs,
    type ContratBailDocData,
} from "@/features/leases/services/contrat-docx.service";
import { ContratBailPdfDocument } from "@/features/leases/pdf/ContratBailPdfDocument";
import type { ContratDocumentValues, PeriodiciteBail } from "@/features/leases/schemas/contrat-document.schema";

export type ContratDocumentDefaults = Omit<ContratDocumentValues, "dateDebut" | "dateSignature"> & {
    /** Dates au format YYYY-MM-DD (valeur d'un <input type="date">). */
    dateDebut: string;
    dateSignature: string;
};

const MONTHS_PER_PERIODICITE: Record<PeriodiciteBail, number> = {
    MENSUEL: 1,
    TRIMESTRIEL: 3,
    SEMESTRIEL: 6,
    ANNUEL: 12,
};

const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const toDateInput = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function toPeriodicite(frequence: FrequenceEcheance): PeriodiciteBail {
    switch (frequence) {
        case FrequenceEcheance.MENSUEL:
            return "MENSUEL";
        case FrequenceEcheance.SEMESTRIEL:
            return "SEMESTRIEL";
        case FrequenceEcheance.ANNUEL:
            return "ANNUEL";
        default:
            return "TRIMESTRIEL";
    }
}

export class ContratDocumentService {
    /** Valeurs proposées dans le formulaire, déduites du contrat enregistré. */
    static async getDefaults(contratId: string): Promise<ContratDocumentDefaults> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findByIdForExport(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        const periodicite = toPeriodicite(contrat.frequence);
        const locataireNom = contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`.trim();

        return {
            civilite: "Monsieur",
            locataireNom,
            nationalite: "",
            pieceIdentite: contrat.locataire.pieceIdentite,
            pieceDelivreeLe: "",
            pieceDelivreeA: "",
            telephone: contrat.locataire.telephone,
            localisation: "",
            surface: contrat.unite.surface,
            composition: `${contrat.unite.nombrePieces} pièce(s)`,
            dateDebut: toDateInput(contrat.dateDebut),
            // En début d'année, un seul bail suffit ; sinon on propose aussi celui de l'année suivante.
            genererContratSuivant: contrat.dateDebut.getMonth() > 0 || contrat.dateDebut.getDate() > 1,
            reconductionAuto: true,
            loyer: contrat.loyerBase,
            periodicite,
            moisAvance: MONTHS_PER_PERIODICITE[periodicite],
            depotMois:
                contrat.loyerBase > 0 ? Math.max(1, Math.round(contrat.depotGarantie / contrat.loyerBase)) : 2,
            depotMontant: contrat.depotGarantie,
            chargesMontant: contrat.charges,
            natureCharges: "",
            tauxPenalite: 5,
            delaiPenaliteJours: 10,
            dateSignature: toDateInput(new Date()),
        } as ContratDocumentDefaults;
    }

    /** Génère le bail n°1 (année de prise d'effet) ou n°2 (année suivante), en Word ou en PDF. */
    static async generate(
        contratId: string,
        values: ContratDocumentValues,
        index: 1 | 2,
        format: "docx" | "pdf"
    ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findByIdForExport(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        if (index === 2 && !values.genererContratSuivant) {
            throw new Error("Le contrat de l'année suivante n'est pas demandé.");
        }

        const startYear = values.dateDebut.getUTCFullYear();
        const dateDebut = index === 1 ? values.dateDebut : new Date(Date.UTC(startYear + 1, 0, 1));
        const dateFin = new Date(Date.UTC(dateDebut.getUTCFullYear(), 11, 31));

        const data: ContratBailDocData = {
            ...values,
            dateDebut,
            dateFin,
            natureCharges: values.natureCharges,
        };

        const docx = await fillContratDocx(data);
        const filenameBase = `Contrat_Bail_${contrat.numeroContrat}_${dateDebut.getUTCFullYear()}`;

        if (format === "docx") {
            return { buffer: docx, filename: `${filenameBase}.docx`, contentType: DOCX_CONTENT_TYPE };
        }

        const paragraphs = await readContratParagraphs(docx);
        const pdf = await renderToBuffer(<ContratBailPdfDocument paragraphs={paragraphs} />);

        return { buffer: Buffer.from(pdf), filename: `${filenameBase}.pdf`, contentType: "application/pdf" };
    }
}
