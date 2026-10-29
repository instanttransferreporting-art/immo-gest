import { renderToBuffer } from "@react-pdf/renderer";

import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import { FREQUENCE_LABELS } from "@/features/leases/constants/lease.constants";
import { TYPE_UNITE_LABELS } from "@/features/units/constants/unit.constants";
import { ContratPdfDocument } from "@/features/leases/pdf/ContratPdfDocument";
import { formatOrganizationAdresse, formatOrganizationContact } from "@/lib/organization-format";
import { documentLogoUrl, loadPdfLogo } from "@/lib/pdf-logo";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export class ContratExportService {
    static async generate(contratId: string): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findByIdForExport(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        const organization = await OrganizationService.getCurrent();
        const logo = await loadPdfLogo(documentLogoUrl(organization));

        const locataireNom =
            contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`;
        const proprietaire = contrat.unite.immeuble.proprietaire;
        const proprietaireNom = proprietaire ? `${proprietaire.nom} ${proprietaire.prenom ?? ""}`.trim() : organization.nom;

        const buffer = await renderToBuffer(
            <ContratPdfDocument
                organizationNom={organization.nom}
                organizationAdresse={formatOrganizationAdresse(organization)}
                organizationContact={formatOrganizationContact(organization)}
                organizationLogo={logo}
                numeroContrat={contrat.numeroContrat}
                proprietaireNom={proprietaireNom}
                locataireNom={locataireNom}
                locatairePieceIdentite={contrat.locataire.pieceIdentite}
                immeubleNom={contrat.unite.immeuble.nom}
                immeubleAdresse={contrat.unite.immeuble.adresse}
                immeubleVille={contrat.unite.immeuble.ville}
                uniteNumero={contrat.unite.numero}
                uniteTypeLabel={TYPE_UNITE_LABELS[contrat.unite.type]}
                dateDebutLabel={dateFormatter.format(contrat.dateDebut)}
                dateFinLabel={dateFormatter.format(contrat.dateFin)}
                loyerBase={contrat.loyerBase}
                charges={contrat.charges}
                frequenceLabel={FREQUENCE_LABELS[contrat.frequence]}
                depotGarantie={contrat.depotGarantie}
            />
        );

        const filename = `Contrat_Bail_${contrat.numeroContrat}.pdf`;

        return { buffer: Buffer.from(buffer), filename };
    }
}
