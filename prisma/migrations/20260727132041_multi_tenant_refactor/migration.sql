-- CreateTable: organizations (created first so we can backfill into it)
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "logo" TEXT,
    "tauxCommissionDefaut" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "adresse" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- Seed a default organization to own all pre-existing data
INSERT INTO "organizations" ("id", "nom", "tauxCommissionDefaut", "updatedAt")
VALUES ('3b8dd407-2a96-44e2-a5d1-d8e99877bdaf', 'Organisation par défaut', 10, CURRENT_TIMESTAMP);

-- AlterTable: add organizationId as NULLABLE first
ALTER TABLE "audit_logs" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "cautions" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "contrats_bail" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "echeances_loyer" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "factures" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "immeubles" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "incidents" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "locataires" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "maintenances" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "paiements" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "proprietaires" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "relances" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "reversements" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "unites" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "users" ADD COLUMN "organizationId" TEXT;

-- Backfill every existing row into the default organization
UPDATE "audit_logs" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "cautions" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "contrats_bail" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "echeances_loyer" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "factures" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "immeubles" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "incidents" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "locataires" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "maintenances" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "paiements" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "proprietaires" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "relances" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "reversements" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "unites" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';
UPDATE "users" SET "organizationId" = '3b8dd407-2a96-44e2-a5d1-d8e99877bdaf';

-- AlterTable: now that every row has a value, make organizationId required
ALTER TABLE "audit_logs" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "cautions" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "contrats_bail" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "echeances_loyer" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "factures" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "immeubles" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "incidents" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "locataires" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "maintenances" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "paiements" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "proprietaires" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "relances" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "reversements" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "unites" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "organizationId" SET NOT NULL;

-- DropIndex: replace global-uniqueness constraints with per-organization uniqueness
DROP INDEX "contrats_bail_numeroContrat_key";
DROP INDEX "factures_numero_key";
DROP INDEX "immeubles_reference_key";
DROP INDEX "locataires_email_key";

-- CreateIndex: organizationId lookup indexes
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");
CREATE INDEX "cautions_organizationId_idx" ON "cautions"("organizationId");
CREATE INDEX "contrats_bail_organizationId_idx" ON "contrats_bail"("organizationId");
CREATE UNIQUE INDEX "contrats_bail_organizationId_numeroContrat_key" ON "contrats_bail"("organizationId", "numeroContrat");
CREATE INDEX "echeances_loyer_organizationId_idx" ON "echeances_loyer"("organizationId");
CREATE INDEX "factures_organizationId_idx" ON "factures"("organizationId");
CREATE UNIQUE INDEX "factures_organizationId_numero_key" ON "factures"("organizationId", "numero");
CREATE INDEX "immeubles_organizationId_idx" ON "immeubles"("organizationId");
CREATE UNIQUE INDEX "immeubles_organizationId_reference_key" ON "immeubles"("organizationId", "reference");
CREATE INDEX "incidents_organizationId_idx" ON "incidents"("organizationId");
CREATE INDEX "locataires_organizationId_idx" ON "locataires"("organizationId");
CREATE UNIQUE INDEX "locataires_organizationId_email_key" ON "locataires"("organizationId", "email");
CREATE INDEX "maintenances_organizationId_idx" ON "maintenances"("organizationId");
CREATE INDEX "paiements_organizationId_idx" ON "paiements"("organizationId");
CREATE INDEX "proprietaires_organizationId_idx" ON "proprietaires"("organizationId");
CREATE INDEX "relances_organizationId_idx" ON "relances"("organizationId");
CREATE INDEX "reversements_organizationId_idx" ON "reversements"("organizationId");
CREATE INDEX "unites_organizationId_idx" ON "unites"("organizationId");
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "proprietaires" ADD CONSTRAINT "proprietaires_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "immeubles" ADD CONSTRAINT "immeubles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unites" ADD CONSTRAINT "unites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "locataires" ADD CONSTRAINT "locataires_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contrats_bail" ADD CONSTRAINT "contrats_bail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "echeances_loyer" ADD CONSTRAINT "echeances_loyer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "factures" ADD CONSTRAINT "factures_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "relances" ADD CONSTRAINT "relances_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cautions" ADD CONSTRAINT "cautions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reversements" ADD CONSTRAINT "reversements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
