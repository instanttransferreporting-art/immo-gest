import { renderToBuffer } from "@react-pdf/renderer";

import { getCurrentOrganizationId } from "@/lib/auth";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import { FREQUENCE_LABELS } from "@/features/leases/constants/lease.constants";
import { TYPE_UNITE_LABELS } from "@/features/units/constants/unit.constants";
import { ContratPdfDocument } from "@/features/leases/pdf/ContratPdfDocument";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export class ContratExportService {
    static async generate(contratId: string): Promise<{ buffer: Buffer; filename: string }> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findByIdForExport(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        const organization = await OrganizationService.getCurrent();

        const locataireNom =
            contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`;
        const proprietaireNom = `${contrat.unite.immeuble.proprietaire.nom} ${contrat.unite.immeuble.proprietaire.prenom ?? ""}`.trim();

        const buffer = await renderToBuffer(
            <ContratPdfDocument
                organizationNom={organization.nom}
                organizationAdresse={organization.adresse}
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
