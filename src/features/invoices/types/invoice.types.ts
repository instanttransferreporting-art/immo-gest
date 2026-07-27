export type StatutFacture = "EN_ATTENTE" | "PAYEE" | "PARTIEL";

export type FactureDTO = Readonly<{
    id: string;
    numero: string;
    echeanceId: string;
    contratId: string;
    mois: number;
    annee: number;
    montantLoyer: number;
    montantCharges: number;
    montantTotal: number;
    penalites: number;
    totalDu: number;
    soldeRestant: number;
    statut: StatutFacture;
    dateEmission: Date;
    contrat: Readonly<{
        id: string;
        numeroContrat: string;
        unite: Readonly<{ numero: string; immeuble: Readonly<{ nom: string }> }>;
        locataire: Readonly<{ nom: string; prenom: string; raisonSociale: string | null }>;
    }>;
}>;
