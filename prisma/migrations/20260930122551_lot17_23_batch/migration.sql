-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "tauxPenaliteRetard" DOUBLE PRECISION NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN     "annuleParId" TEXT,
ADD COLUMN     "dateAnnulation" TIMESTAMP(3),
ADD COLUMN     "motifAnnulation" TEXT;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_annuleParId_fkey" FOREIGN KEY ("annuleParId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
