import { defineMessages } from "@/i18n/define";

/**
 * Libellés des énumérations métier pour l'interface. Les constantes `*_LABELS`
 * historiques (en français) restent la source des documents envoyés aux locataires
 * (PDF, emails) et des textes du journal d'audit, qui ne sont pas traduits.
 */
export const enums = defineMessages({
    fr: {
        role: {
            SUPER_ADMIN: "Super Administrateur",
            ADMIN: "Administrateur",
            GESTIONNAIRE: "Gestionnaire Immobilier",
            COMPTABLE: "Comptable",
            DIRECTEUR_GENERAL: "Directeur Général",
        },
        typeUnite: {
            APPARTEMENT: "Appartement",
            VILLA: "Villa",
            BUREAU: "Bureau",
            COMMERCE: "Commerce",
            ENTREPOT: "Entrepôt",
            STUDIO: "Studio",
            CHAMBRE: "Chambre",
            DUPLEX: "Duplex",
        },
        etatUnite: {
            LIBRE: "Libre",
            OCCUPE: "Occupé",
            RESERVE: "Réservé",
        },
        typeCharges: {
            FORFAITAIRE: "Forfaitaire",
            POURCENTAGE: "Pourcentage du loyer",
        },
        frequencePaiement: {
            NUITEE: "À la nuitée",
            HEBDOMADAIRE: "Hebdomadaire",
            MENSUEL: "Mensuel",
            TRIMESTRIEL: "Trimestriel",
            ANNUEL: "Annuel",
            AUTRE: "Autre",
        },
        frequenceEcheance: {
            QUOTIDIEN: "Quotidien",
            MENSUEL: "Mensuel",
            BIMENSUEL: "Bimensuel",
            TRIMESTRIEL: "Trimestriel",
            SEMESTRIEL: "Semestriel",
            ANNUEL: "Annuel",
        },
        periodiciteBail: {
            MENSUEL: "Mensuelle",
            TRIMESTRIEL: "Trimestrielle",
            SEMESTRIEL: "Semestrielle",
            ANNUEL: "Annuelle",
        },
        civilite: {
            Monsieur: "Monsieur",
            Madame: "Madame",
        },
        statutBail: {
            ACTIF: "Actif",
            SUSPENDU: "Suspendu",
            RESILIE: "Résilié",
            EXPIRE: "Expiré",
        },
        typeLocataire: {
            PHYSIQUE: "Personne Physique",
            MORALE: "Personne Morale",
        },
        typeDocumentLocataire: {
            CNI: "Pièce d'identité (CNI)",
            PHOTO_4X4: "Photo 4x4",
            CONTRAT_SIMPLIFIE: "Contrat simplifié",
            CONTRAT_SIGNE: "Contrat signé",
            PREUVE_ENREGISTREMENT: "Preuve d'enregistrement",
        },
        typeDocumentContrat: {
            CONTRAT_SIGNE: "Contrat de bail signé",
            CONTRAT_SIGNE_SUIVANT: "Contrat de bail signé — année suivante",
            ETAT_LIEUX_ENTREE: "État des lieux d'entrée",
            ETAT_LIEUX_SORTIE: "État des lieux de sortie",
        },
        typeDocumentContratHint: {
            CONTRAT_SIGNE: "Scan du bail signé par les deux parties.",
            CONTRAT_SIGNE_SUIVANT:
                "Second bail (1er janvier – 31 décembre de l'année suivante), signé par les deux parties.",
            ETAT_LIEUX_ENTREE: "À téléverser à l'entrée du locataire, après signature.",
            ETAT_LIEUX_SORTIE: "À téléverser à la sortie du locataire.",
        },
        statutCaution: {
            EN_COURS: "En cours",
            RESTITUEE_TOTALE: "Restituée intégralement",
            RESTITUEE_PARTIELLE: "Restituée partiellement",
            RETENUE_TRAVAUX: "Retenue pour travaux",
        },
        statutFacture: {
            EN_ATTENTE: "En attente",
            PAYEE: "Payée",
            PARTIEL: "Partiel",
        },
        modePaiement: {
            ESPECES: "Espèces",
            VIREMENT_BANCAIRE: "Virement bancaire",
            MOBILE_MONEY: "Mobile Money",
        },
        niveauRelance: {
            NIVEAU_1: "Rappel amiable",
            NIVEAU_1_BIS: "2e rappel amiable",
            NIVEAU_2: "Mise en demeure",
            NIVEAU_3: "Contentieux",
        },
        prochaineAction: {
            NIVEAU_1: "Envoyer un rappel amiable",
            NIVEAU_1_BIS: "Envoyer le 2e rappel",
            NIVEAU_2: "Envoyer la mise en demeure",
            NIVEAU_3: "Passer au contentieux",
        },
        prioriteIncident: {
            BASSE: "Basse",
            MOYENNE: "Moyenne",
            HAUTE: "Haute",
        },
        statutIncident: {
            NOUVEAU: "Nouveau",
            EN_COURS: "En cours",
            RESOLU: "Résolu",
        },
        statutReversement: {
            BROUILLON: "Brouillon",
            VALIDE: "Validé",
        },
    },
    en: {
        role: {
            SUPER_ADMIN: "Super Administrator",
            ADMIN: "Administrator",
            GESTIONNAIRE: "Property Manager",
            COMPTABLE: "Accountant",
            DIRECTEUR_GENERAL: "Managing Director",
        },
        typeUnite: {
            APPARTEMENT: "Apartment",
            VILLA: "Villa",
            BUREAU: "Office",
            COMMERCE: "Retail unit",
            ENTREPOT: "Warehouse",
            STUDIO: "Studio",
            CHAMBRE: "Room",
            DUPLEX: "Duplex",
        },
        etatUnite: {
            LIBRE: "Vacant",
            OCCUPE: "Occupied",
            RESERVE: "Reserved",
        },
        typeCharges: {
            FORFAITAIRE: "Flat rate",
            POURCENTAGE: "Percentage of rent",
        },
        frequencePaiement: {
            NUITEE: "Per night",
            HEBDOMADAIRE: "Weekly",
            MENSUEL: "Monthly",
            TRIMESTRIEL: "Quarterly",
            ANNUEL: "Yearly",
            AUTRE: "Other",
        },
        frequenceEcheance: {
            QUOTIDIEN: "Daily",
            MENSUEL: "Monthly",
            BIMENSUEL: "Every two months",
            TRIMESTRIEL: "Quarterly",
            SEMESTRIEL: "Half-yearly",
            ANNUEL: "Yearly",
        },
        periodiciteBail: {
            MENSUEL: "Monthly",
            TRIMESTRIEL: "Quarterly",
            SEMESTRIEL: "Half-yearly",
            ANNUEL: "Yearly",
        },
        civilite: {
            Monsieur: "Mr",
            Madame: "Ms",
        },
        statutBail: {
            ACTIF: "Active",
            SUSPENDU: "Suspended",
            RESILIE: "Terminated",
            EXPIRE: "Expired",
        },
        typeLocataire: {
            PHYSIQUE: "Individual",
            MORALE: "Company",
        },
        typeDocumentLocataire: {
            CNI: "ID document (CNI)",
            PHOTO_4X4: "4x4 photo",
            CONTRAT_SIMPLIFIE: "Simplified lease",
            CONTRAT_SIGNE: "Signed lease",
            PREUVE_ENREGISTREMENT: "Proof of registration",
        },
        typeDocumentContrat: {
            CONTRAT_SIGNE: "Signed lease agreement",
            CONTRAT_SIGNE_SUIVANT: "Signed lease agreement — following year",
            ETAT_LIEUX_ENTREE: "Move-in inspection report",
            ETAT_LIEUX_SORTIE: "Move-out inspection report",
        },
        typeDocumentContratHint: {
            CONTRAT_SIGNE: "Scan of the lease signed by both parties.",
            CONTRAT_SIGNE_SUIVANT: "Second lease (January 1 – December 31 of the following year), signed by both parties.",
            ETAT_LIEUX_ENTREE: "Upload when the tenant moves in, after signature.",
            ETAT_LIEUX_SORTIE: "Upload when the tenant moves out.",
        },
        statutCaution: {
            EN_COURS: "Held",
            RESTITUEE_TOTALE: "Fully returned",
            RESTITUEE_PARTIELLE: "Partially returned",
            RETENUE_TRAVAUX: "Retained for repairs",
        },
        statutFacture: {
            EN_ATTENTE: "Pending",
            PAYEE: "Paid",
            PARTIEL: "Partial",
        },
        modePaiement: {
            ESPECES: "Cash",
            VIREMENT_BANCAIRE: "Bank transfer",
            MOBILE_MONEY: "Mobile Money",
        },
        niveauRelance: {
            NIVEAU_1: "Friendly reminder",
            NIVEAU_1_BIS: "2nd friendly reminder",
            NIVEAU_2: "Formal notice",
            NIVEAU_3: "Litigation",
        },
        prochaineAction: {
            NIVEAU_1: "Send a friendly reminder",
            NIVEAU_1_BIS: "Send the 2nd reminder",
            NIVEAU_2: "Send the formal notice",
            NIVEAU_3: "Escalate to litigation",
        },
        prioriteIncident: {
            BASSE: "Low",
            MOYENNE: "Medium",
            HAUTE: "High",
        },
        statutIncident: {
            NOUVEAU: "New",
            EN_COURS: "In progress",
            RESOLU: "Resolved",
        },
        statutReversement: {
            BROUILLON: "Draft",
            VALIDE: "Approved",
        },
    },
});
