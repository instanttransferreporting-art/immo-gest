-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'GESTIONNAIRE', 'COMPTABLE', 'DIRECTEUR_GENERAL');

-- CreateEnum
CREATE TYPE "TypeUnite" AS ENUM ('APPARTEMENT', 'VILLA', 'BUREAU', 'COMMERCE', 'ENTREPOT');

-- CreateEnum
CREATE TYPE "EtatUnite" AS ENUM ('LIBRE', 'OCCUPE', 'RESERVE');

-- CreateEnum
CREATE TYPE "TypeCharges" AS ENUM ('FORFAITAIRE', 'POURCENTAGE');

-- CreateEnum
CREATE TYPE "TypeLocataire" AS ENUM ('PHYSIQUE', 'MORALE');

-- CreateEnum
CREATE TYPE "FrequenceEcheance" AS ENUM ('QUOTIDIEN', 'MENSUEL', 'BIMENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL');

-- CreateEnum
CREATE TYPE "StatutBail" AS ENUM ('ACTIF', 'SUSPENDU', 'RESILIE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'VIREMENT_BANCAIRE', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "NiveauRelance" AS ENUM ('NIVEAU_1', 'NIVEAU_1_BIS', 'NIVEAU_2', 'NIVEAU_3');

-- CreateEnum
CREATE TYPE "StatutCaution" AS ENUM ('EN_COURS', 'RESTITUEE_TOTALE', 'RESTITUEE_PARTIELLE', 'RETENUE_TRAVAUX');

-- CreateEnum
CREATE TYPE "CategorieMaintenance" AS ENUM ('PLOMBERIE', 'ELECTRICITE', 'PEINTURE', 'SECURITE', 'CLIMATISATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutMaintenance" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU', 'ANNULE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "RoleType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proprietaires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proprietaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telephone_proprietaires" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estPrincipal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "telephone_proprietaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_proprietaires" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "estPrincipal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "email_proprietaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immeubles" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "nombreNiveaux" INTEGER NOT NULL,
    "nombreLogements" INTEGER NOT NULL,
    "valeurEstimative" DOUBLE PRECISION,
    "proprietaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immeubles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unites" (
    "id" TEXT NOT NULL,
    "immeubleId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "TypeUnite" NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "nombrePieces" INTEGER NOT NULL,
    "loyerMensuel" DOUBLE PRECISION NOT NULL,
    "typeCharges" "TypeCharges" NOT NULL,
    "valeurCharges" DOUBLE PRECISION NOT NULL,
    "caution" DOUBLE PRECISION NOT NULL,
    "etat" "EtatUnite" NOT NULL DEFAULT 'LIBRE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locataires" (
    "id" TEXT NOT NULL,
    "type" "TypeLocataire" NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "profession" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "pieceIdentite" TEXT NOT NULL,
    "revenuMensuelMoyen" DOUBLE PRECISION,
    "raisonSociale" TEXT,
    "rccm" TEXT,
    "niu" TEXT,
    "telephoneMoral" TEXT,
    "emailMoral" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locataires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_locataires" (
    "id" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_locataires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats_bail" (
    "id" TEXT NOT NULL,
    "numeroContrat" TEXT NOT NULL,
    "uniteId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "loyerBase" DOUBLE PRECISION NOT NULL,
    "charges" DOUBLE PRECISION NOT NULL,
    "depotGarantie" DOUBLE PRECISION NOT NULL,
    "frequence" "FrequenceEcheance" NOT NULL DEFAULT 'MENSUEL',
    "statut" "StatutBail" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_bail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "echeances_loyer" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "montantLoyer" DOUBLE PRECISION NOT NULL,
    "montantCharges" DOUBLE PRECISION NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "soldeRestant" DOUBLE PRECISION NOT NULL,
    "estPaye" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "echeances_loyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "penalites" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDu" DOUBLE PRECISION NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estSoldee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "ModePaiement" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estAnnule" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relances" (
    "id" TEXT NOT NULL,
    "echeanceId" TEXT NOT NULL,
    "niveau" "NiveauRelance" NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,

    CONSTRAINT "relances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cautions" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "montantInitial" DOUBLE PRECISION NOT NULL,
    "montantRetenu" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montantRendu" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statut" "StatutCaution" NOT NULL DEFAULT 'EN_COURS',
    "dateRestitution" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cautions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "technicienId" TEXT,
    "categorie" "CategorieMaintenance" NOT NULL,
    "description" TEXT NOT NULL,
    "prestataire" TEXT,
    "cout" DOUBLE PRECISION,
    "statut" "StatutMaintenance" NOT NULL DEFAULT 'OUVERT',
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolution" TIMESTAMP(3),

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "immeubles_reference_key" ON "immeubles"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "locataires_email_key" ON "locataires"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_bail_numeroContrat_key" ON "contrats_bail"("numeroContrat");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telephone_proprietaires" ADD CONSTRAINT "telephone_proprietaires_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "proprietaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_proprietaires" ADD CONSTRAINT "email_proprietaires_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "proprietaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immeubles" ADD CONSTRAINT "immeubles_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "proprietaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unites" ADD CONSTRAINT "unites_immeubleId_fkey" FOREIGN KEY ("immeubleId") REFERENCES "immeubles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_locataires" ADD CONSTRAINT "document_locataires_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_bail" ADD CONSTRAINT "contrats_bail_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_bail" ADD CONSTRAINT "contrats_bail_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "echeances_loyer" ADD CONSTRAINT "echeances_loyer_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats_bail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "echeances_loyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "echeances_loyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relances" ADD CONSTRAINT "relances_echeanceId_fkey" FOREIGN KEY ("echeanceId") REFERENCES "echeances_loyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cautions" ADD CONSTRAINT "cautions_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats_bail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
