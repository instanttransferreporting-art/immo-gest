import { renderToBuffer } from "@react-pdf/renderer";

import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import { QuittancePdfDocument } from "@/features/invoices/pdf/QuittancePdfDocument";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const DIACRITICS_PATTERN = new RegExp("[̀-ͯ]", "g");

function toFilenameSegment(value: string): string {
    return value.normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

type BuildQuittancePdfParams = {
    organizationNom: string;
    organizationAdresse: string | null;
    facture: FactureDTO;
    totalEncaisse: number;
};

/**
 * Construit le PDF de quittance à partir de données déjà chargées — ne fait
 * aucun appel base de données. Séparé de `QuittanceExportService` pour éviter
 * une dépendance circulaire avec `facture.service.ts`, qui appelle cette
 * fonction pour joindre la facture aux emails (avis d'échéance, relance).
 */
export async function buildQuittancePdf(params: BuildQuittancePdfParams): Promise<{
    buffer: Buffer;
    filename: string;
}> {
    const { organizationNom, organizationAdresse, facture, totalEncaisse } = params;

    const locataireNom =
        facture.contrat.locataire.raisonSociale ??
        `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`;

    const buffer = await renderToBuffer(
        <QuittancePdfDocument
            organizationNom={organizationNom}
            organizationAdresse={organizationAdresse}
            numeroFacture={facture.numero}
            periodeLabel={`${MOIS_LABELS[facture.mois - 1]} ${facture.annee}`}
            dateEmissionLabel={dateFormatter.format(facture.dateEmission)}
            locataireNom={locataireNom}
            uniteLabel={`${facture.contrat.unite.immeuble.nom} — ${facture.contrat.unite.numero}`}
            montantLoyer={facture.montantLoyer}
            montantCharges={facture.montantCharges}
            penalites={facture.penalites}
            totalDu={facture.totalDu}
            totalEncaisse={totalEncaisse}
            soldeRestant={facture.soldeRestant}
        />
    );

    const moisSegment = toFilenameSegment(MOIS_LABELS[facture.mois - 1]);
    const filename = `Quittance_Loyer_${moisSegment}_${facture.annee}.pdf`;

    return { buffer: Buffer.from(buffer), filename };
}

/**
 * Même chose que `buildQuittancePdf`, mais ne lève jamais — retourne `undefined`
 * en cas d'échec de rendu, pour les appelants "fire-and-forget" (emails) où un
 * problème de génération PDF ne doit jamais bloquer l'envoi de l'email lui-même.
 */
export async function buildQuittancePdfSafe(
    params: BuildQuittancePdfParams
): Promise<{ filename: string; content: Buffer } | undefined> {
    try {
        const { buffer, filename } = await buildQuittancePdf(params);
        return { filename, content: buffer };
    } catch (error) {
        console.error("[mail] Échec de la génération de la pièce jointe PDF", error);
        return undefined;
    }
}
