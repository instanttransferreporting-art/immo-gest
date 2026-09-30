import { OrganizationService } from "@/features/organizations/services/organization.service";
import { PaiementService } from "@/features/payments/services/paiement.service";
import { FactureNotFoundError, FactureService } from "@/features/invoices/services/facture.service";
import { buildQuittancePdf } from "@/features/invoices/pdf/quittance-pdf-builder";

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

        return buildQuittancePdf({
            organizationNom: organization.nom,
            organizationAdresse: organization.adresse,
            facture,
            totalEncaisse,
        });
    }
}
