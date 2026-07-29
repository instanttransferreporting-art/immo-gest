import { renderToBuffer } from "@react-pdf/renderer";

import { OrganizationService } from "@/features/organizations/services/organization.service";
import { PaiementService } from "@/features/payments/services/paiement.service";
import { FactureNotFoundError, FactureService } from "@/features/invoices/services/facture.service";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";
import { QuittancePdfDocument } from "@/features/invoices/pdf/QuittancePdfDocument";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const DIACRITICS_PATTERN = new RegExp("[̀-ͯ]", "g");

function toFilenameSegment(value: string): string {
    return value.normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

export class QuittanceExportService {
    static async generate(factureId: string): Promise<{ buffer: Buffer; filename: string }> {
        const facture = await FactureService.getById(factureId);

        if (!facture) {
            throw new FactureNotFoundError();
        }

        const [organization, paiements] = await Promise.all([
            OrganizationService.getCurrent(),
            PaiementService.listByFacture(factureId),
        ]);

        const totalEncaisse = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
        const locataireNom =
            facture.contrat.locataire.raisonSociale ??
            `${facture.contrat.locataire.nom} ${facture.contrat.locataire.prenom}`;

        const buffer = await renderToBuffer(
            <QuittancePdfDocument
                organizationNom={organization.nom}
                organizationAdresse={organization.adresse}
                numeroFacture={facture.numero}
                periodeLabel={`${MOIS_LABELS[facture.mois - 1]} ${facture.annee}`}
                dateEmissionLabel={dateFormatter.format(facture.dateEmission)}
                locataireNom={locataireNom}
                uniteLabel={`${facture.contrat.unite.immeuble.nom} — ${facture.contrat.unite.numero}`}
                montantLoyer={facture.montantLoyer}
                montantCharges={facture.montantCharges}
                totalDu={facture.totalDu}
                totalEncaisse={totalEncaisse}
                soldeRestant={facture.soldeRestant}
            />
        );

        const moisSegment = toFilenameSegment(MOIS_LABELS[facture.mois - 1]);
        const filename = `Quittance_Loyer_${moisSegment}_${facture.annee}.pdf`;

        return { buffer: Buffer.from(buffer), filename };
    }
}
