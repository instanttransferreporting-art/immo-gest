-- CreateEnum
CREATE TYPE "FrequencePaiement" AS ENUM ('NUITEE', 'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL', 'ANNUEL', 'AUTRE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeUnite" ADD VALUE 'STUDIO';
ALTER TYPE "TypeUnite" ADD VALUE 'CHAMBRE';
ALTER TYPE "TypeUnite" ADD VALUE 'DUPLEX';

-- AlterTable
ALTER TABLE "unites" ADD COLUMN     "frequenceAutreTexte" TEXT,
ADD COLUMN     "frequencePaiement" "FrequencePaiement" NOT NULL DEFAULT 'MENSUEL',
ADD COLUMN     "isMeuble" BOOLEAN NOT NULL DEFAULT false;
