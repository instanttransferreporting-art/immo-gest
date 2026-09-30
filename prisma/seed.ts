import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import {
    RoleType,
    TypeUnite,
    EtatUnite,
    TypeCharges,
    FrequencePaiement,
    TypeLocataire,
    FrequenceEcheance,
    StatutBail,
    ModePaiement,
    NiveauRelance,
    StatutCaution,
    PrioriteIncident,
    StatutIncident,
} from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

const PASSWORD_SALT_ROUNDS = 10;
const SEED_PASSWORD = "Test1234!";
const ORG_ID = "00000000-0000-0000-0000-000000000001";

function d(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00.000Z`);
}

async function main() {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, PASSWORD_SALT_ROUNDS);

    const superAdmin = await prisma.user.upsert({
        where: { email: "superadmin@test.com" },
        update: {},
        create: {
            email: "superadmin@test.com",
            nom: "Admin",
            prenom: "Super",
            passwordHash,
            role: RoleType.SUPER_ADMIN,
            organizationId: null,
        },
    });

    const organization = await prisma.organization.upsert({
        where: { id: ORG_ID },
        update: {},
        create: {
            id: ORG_ID,
            nom: "Agence de Test",
            email: "contact@agence-test.com",
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: "admin@test.com" },
        update: {},
        create: {
            email: "admin@test.com",
            nom: "Admin",
            prenom: "Agence",
            passwordHash,
            role: RoleType.ADMIN,
            organizationId: organization.id,
        },
    });

    const dg = await prisma.user.upsert({
        where: { email: "dg@test.com" },
        update: {},
        create: {
            email: "dg@test.com",
            nom: "Directeur",
            prenom: "Général",
            passwordHash,
            role: RoleType.DIRECTEUR_GENERAL,
            organizationId: organization.id,
        },
    });

    // ---------------------------------------------------------------
    // Propriétaires
    // ---------------------------------------------------------------

    const prop1 = await prisma.proprietaire.upsert({
        where: { id: "seed-prop-1" },
        update: {},
        create: {
            id: "seed-prop-1",
            organizationId: organization.id,
            nom: "Fotso",
            prenom: "Paul",
            adresse: "Rue de la Réunification",
            ville: "Douala",
            tauxCommission: 10,
            telephones: { create: [{ numero: "+237699112233", estPrincipal: true }] },
            emails: { create: [{ email: "paul.fotso@example.com", estPrincipal: true }] },
        },
    });

    const prop2 = await prisma.proprietaire.upsert({
        where: { id: "seed-prop-2" },
        update: {},
        create: {
            id: "seed-prop-2",
            organizationId: organization.id,
            nom: "Société Immo Plus SARL",
            adresse: "45 Boulevard de la Liberté",
            ville: "Douala",
            tauxCommission: 12,
            telephones: { create: [{ numero: "+237233445566", estPrincipal: true }] },
            emails: { create: [{ email: "contact@immoplus.cm", estPrincipal: true }] },
        },
    });

    // ---------------------------------------------------------------
    // Immeubles
    // ---------------------------------------------------------------

    const imm1 = await prisma.immeuble.upsert({
        where: { id: "seed-imm-1" },
        update: {},
        create: {
            id: "seed-imm-1",
            organizationId: organization.id,
            reference: "IMM-2026-000001",
            nom: "Résidence Bonanjo",
            adresse: "123 Avenue du Général de Gaulle",
            ville: "Douala",
            nombreNiveaux: 4,
            valeurEstimative: 150_000_000,
            proprietaireId: prop1.id,
        },
    });

    const imm2 = await prisma.immeuble.upsert({
        where: { id: "seed-imm-2" },
        update: {},
        create: {
            id: "seed-imm-2",
            organizationId: organization.id,
            reference: "IMM-2026-000002",
            nom: "Akwa Business Center",
            adresse: "45 Boulevard de la Liberté",
            ville: "Douala",
            nombreNiveaux: 6,
            valeurEstimative: 320_000_000,
            proprietaireId: prop2.id,
        },
    });

    // ---------------------------------------------------------------
    // Unités
    // ---------------------------------------------------------------

    const unite1 = await prisma.unite.upsert({
        where: { id: "seed-unite-1" },
        update: {},
        create: {
            id: "seed-unite-1",
            organizationId: organization.id,
            immeubleId: imm1.id,
            numero: "A12",
            type: TypeUnite.APPARTEMENT,
            surface: 65,
            nombrePieces: 3,
            loyerMensuel: 150_000,
            typeCharges: TypeCharges.FORFAITAIRE,
            valeurCharges: 10_000,
            caution: 300_000,
            etat: EtatUnite.OCCUPE,
        },
    });

    const unite2 = await prisma.unite.upsert({
        where: { id: "seed-unite-2" },
        update: {},
        create: {
            id: "seed-unite-2",
            organizationId: organization.id,
            immeubleId: imm1.id,
            numero: "A21",
            type: TypeUnite.STUDIO,
            surface: 30,
            nombrePieces: 1,
            loyerMensuel: 75_000,
            typeCharges: TypeCharges.FORFAITAIRE,
            valeurCharges: 5_000,
            caution: 150_000,
            etat: EtatUnite.OCCUPE,
        },
    });

    const unite3 = await prisma.unite.upsert({
        where: { id: "seed-unite-3" },
        update: {},
        create: {
            id: "seed-unite-3",
            organizationId: organization.id,
            immeubleId: imm2.id,
            numero: "B04",
            type: TypeUnite.BUREAU,
            surface: 45,
            nombrePieces: 2,
            loyerMensuel: 200_000,
            typeCharges: TypeCharges.FORFAITAIRE,
            valeurCharges: 10_000,
            caution: 400_000,
            etat: EtatUnite.OCCUPE,
        },
    });

    const unite4 = await prisma.unite.upsert({
        where: { id: "seed-unite-4" },
        update: {},
        create: {
            id: "seed-unite-4",
            organizationId: organization.id,
            immeubleId: imm1.id,
            numero: "A05",
            type: TypeUnite.VILLA,
            surface: 80,
            nombrePieces: 4,
            loyerMensuel: 25_000,
            typeCharges: TypeCharges.FORFAITAIRE,
            valeurCharges: 0,
            caution: 50_000,
            etat: EtatUnite.OCCUPE,
            isMeuble: true,
            frequencePaiement: FrequencePaiement.NUITEE,
        },
    });

    const unite5 = await prisma.unite.upsert({
        where: { id: "seed-unite-5" },
        update: {},
        create: {
            id: "seed-unite-5",
            organizationId: organization.id,
            immeubleId: imm2.id,
            numero: "B10",
            type: TypeUnite.COMMERCE,
            surface: 100,
            nombrePieces: 1,
            loyerMensuel: 350_000,
            typeCharges: TypeCharges.FORFAITAIRE,
            valeurCharges: 20_000,
            caution: 700_000,
            etat: EtatUnite.LIBRE,
        },
    });

    // ---------------------------------------------------------------
    // Locataires
    // ---------------------------------------------------------------

    const loc1 = await prisma.locataire.upsert({
        where: { id: "seed-loc-1" },
        update: {},
        create: {
            id: "seed-loc-1",
            organizationId: organization.id,
            type: TypeLocataire.PHYSIQUE,
            nom: "Mballa",
            prenom: "Jean",
            telephone: "+237677001122",
            email: "jean.mballa@example.com",
            adresse: "Douala, Bonapriso",
            pieceIdentite: "CM0012345",
            profession: "Ingénieur",
            revenuMensuelMoyen: 450_000,
        },
    });

    const loc2 = await prisma.locataire.upsert({
        where: { id: "seed-loc-2" },
        update: {},
        create: {
            id: "seed-loc-2",
            organizationId: organization.id,
            type: TypeLocataire.PHYSIQUE,
            nom: "Njoya",
            prenom: "Aicha",
            telephone: "+237690112233",
            email: "aicha.njoya@example.com",
            adresse: "Douala, Akwa",
            pieceIdentite: "CM0054321",
            profession: "Commerçante",
            revenuMensuelMoyen: 300_000,
        },
    });

    const loc3 = await prisma.locataire.upsert({
        where: { id: "seed-loc-3" },
        update: {},
        create: {
            id: "seed-loc-3",
            organizationId: organization.id,
            type: TypeLocataire.MORALE,
            nom: "Kamga",
            prenom: "Eric",
            telephone: "+237655667788",
            email: "eric.kamga@example.com",
            adresse: "Douala, Bonanjo",
            pieceIdentite: "CM0098765",
            raisonSociale: "Cameroun Digital Services SARL",
            rccm: "RC/DLA/2020/B/1234",
            niu: "M012345678",
            telephoneMoral: "+237233445566",
            emailMoral: "contact@cds.cm",
        },
    });

    const loc4 = await prisma.locataire.upsert({
        where: { id: "seed-loc-4" },
        update: {},
        create: {
            id: "seed-loc-4",
            organizationId: organization.id,
            type: TypeLocataire.PHYSIQUE,
            nom: "Talla",
            prenom: "Marc",
            telephone: "+237677889900",
            email: "marc.talla@example.com",
            adresse: "Douala, Deido",
            pieceIdentite: "CM0011223",
            profession: "Consultant",
            revenuMensuelMoyen: 600_000,
        },
    });

    // ---------------------------------------------------------------
    // Contrats de bail
    // ---------------------------------------------------------------

    const contrat1 = await prisma.contratBail.upsert({
        where: { id: "seed-contrat-1" },
        update: {},
        create: {
            id: "seed-contrat-1",
            organizationId: organization.id,
            numeroContrat: "CTR-2026-000001",
            uniteId: unite1.id,
            locataireId: loc1.id,
            dateDebut: d("2026-01-15"),
            dateFin: d("2026-12-31"),
            loyerBase: 150_000,
            charges: 10_000,
            depotGarantie: 300_000,
            frequence: FrequenceEcheance.MENSUEL,
            statut: StatutBail.ACTIF,
        },
    });

    const contrat2 = await prisma.contratBail.upsert({
        where: { id: "seed-contrat-2" },
        update: {},
        create: {
            id: "seed-contrat-2",
            organizationId: organization.id,
            numeroContrat: "CTR-2026-000002",
            uniteId: unite3.id,
            locataireId: loc3.id,
            dateDebut: d("2026-03-01"),
            dateFin: d("2026-12-31"),
            loyerBase: 200_000,
            charges: 10_000,
            depotGarantie: 400_000,
            frequence: FrequenceEcheance.MENSUEL,
            statut: StatutBail.ACTIF,
        },
    });

    const contrat3 = await prisma.contratBail.upsert({
        where: { id: "seed-contrat-3" },
        update: {},
        create: {
            id: "seed-contrat-3",
            organizationId: organization.id,
            numeroContrat: "CTR-2026-000003",
            uniteId: unite2.id,
            locataireId: loc2.id,
            dateDebut: d("2026-02-01"),
            dateFin: d("2026-12-31"),
            loyerBase: 75_000,
            charges: 5_000,
            depotGarantie: 150_000,
            frequence: FrequenceEcheance.MENSUEL,
            statut: StatutBail.ACTIF,
        },
    });

    const contrat4 = await prisma.contratBail.upsert({
        where: { id: "seed-contrat-4" },
        update: {},
        create: {
            id: "seed-contrat-4",
            organizationId: organization.id,
            numeroContrat: "CTR-2026-000004",
            uniteId: unite4.id,
            locataireId: loc4.id,
            dateDebut: d("2026-09-25"),
            dateFin: d("2026-09-28"),
            loyerBase: 75_000,
            charges: 0,
            depotGarantie: 50_000,
            frequence: FrequenceEcheance.QUOTIDIEN,
            nombreNuitees: 3,
            statut: StatutBail.EXPIRE,
        },
    });

    // ---------------------------------------------------------------
    // Cautions
    // ---------------------------------------------------------------

    await prisma.caution.upsert({
        where: { id: "seed-caution-1" },
        update: {},
        create: {
            id: "seed-caution-1",
            organizationId: organization.id,
            contratId: contrat1.id,
            montantInitial: 300_000,
            statut: StatutCaution.EN_COURS,
        },
    });

    await prisma.caution.upsert({
        where: { id: "seed-caution-2" },
        update: {},
        create: {
            id: "seed-caution-2",
            organizationId: organization.id,
            contratId: contrat2.id,
            montantInitial: 400_000,
            statut: StatutCaution.EN_COURS,
        },
    });

    await prisma.caution.upsert({
        where: { id: "seed-caution-3" },
        update: {},
        create: {
            id: "seed-caution-3",
            organizationId: organization.id,
            contratId: contrat3.id,
            montantInitial: 150_000,
            statut: StatutCaution.EN_COURS,
        },
    });

    await prisma.caution.upsert({
        where: { id: "seed-caution-4" },
        update: {},
        create: {
            id: "seed-caution-4",
            organizationId: organization.id,
            contratId: contrat4.id,
            montantInitial: 50_000,
            montantRendu: 50_000,
            statut: StatutCaution.RESTITUEE_TOTALE,
            dateRestitution: d("2026-09-29"),
        },
    });

    // ---------------------------------------------------------------
    // Échéances + Factures + Paiements
    // ---------------------------------------------------------------

    type EcheanceSeed = {
        id: string;
        contratId: string;
        dateEcheance: Date;
        montantLoyer: number;
        montantCharges: number;
        facture: {
            id: string;
            numero: string;
            penalites: number;
            avisEnvoye: boolean;
            avisEnvoyeAt?: Date;
        };
        paiement?: {
            id: string;
            mode: (typeof ModePaiement)[keyof typeof ModePaiement];
            reference: string;
            datePaiement: Date;
        };
        relances?: { id: string; niveau: (typeof NiveauRelance)[keyof typeof NiveauRelance]; dateEnvoi: Date }[];
    };

    const echeances: EcheanceSeed[] = [
        // Contrat 1 (Jean Mballa) — Juillet payé, Août impayé (60 jours de retard)
        {
            id: "seed-ech-1-1",
            contratId: contrat1.id,
            dateEcheance: d("2026-07-01"),
            montantLoyer: 150_000,
            montantCharges: 10_000,
            facture: { id: "seed-fac-1", numero: "FAC-2026-000001", penalites: 0, avisEnvoye: true, avisEnvoyeAt: d("2026-06-26") },
            paiement: { id: "seed-pm-1", mode: ModePaiement.VIREMENT_BANCAIRE, reference: "VIR-20260701-001", datePaiement: d("2026-07-02") },
        },
        {
            id: "seed-ech-1-2",
            contratId: contrat1.id,
            dateEcheance: d("2026-08-01"),
            montantLoyer: 150_000,
            montantCharges: 10_000,
            facture: { id: "seed-fac-2", numero: "FAC-2026-000002", penalites: 8_000, avisEnvoye: true, avisEnvoyeAt: d("2026-07-27") },
            relances: [
                { id: "seed-rel-1", niveau: NiveauRelance.NIVEAU_1, dateEnvoi: d("2026-08-01") },
                { id: "seed-rel-2", niveau: NiveauRelance.NIVEAU_1_BIS, dateEnvoi: d("2026-08-16") },
                { id: "seed-rel-3", niveau: NiveauRelance.NIVEAU_2, dateEnvoi: d("2026-08-31") },
            ],
        },
        // Contrat 2 (Cameroun Digital Services) — Septembre impayé (29 jours de retard)
        {
            id: "seed-ech-2-1",
            contratId: contrat2.id,
            dateEcheance: d("2026-09-01"),
            montantLoyer: 200_000,
            montantCharges: 10_000,
            facture: { id: "seed-fac-3", numero: "FAC-2026-000003", penalites: 10_500, avisEnvoye: true, avisEnvoyeAt: d("2026-08-27") },
            relances: [
                { id: "seed-rel-4", niveau: NiveauRelance.NIVEAU_1, dateEnvoi: d("2026-09-01") },
                { id: "seed-rel-5", niveau: NiveauRelance.NIVEAU_1_BIS, dateEnvoi: d("2026-09-16") },
            ],
        },
        // Contrat 3 (Aicha Njoya) — locataire à jour, 3 mois payés
        {
            id: "seed-ech-3-1",
            contratId: contrat3.id,
            dateEcheance: d("2026-07-01"),
            montantLoyer: 75_000,
            montantCharges: 5_000,
            facture: { id: "seed-fac-4", numero: "FAC-2026-000004", penalites: 0, avisEnvoye: true, avisEnvoyeAt: d("2026-06-26") },
            paiement: { id: "seed-pm-2", mode: ModePaiement.MOBILE_MONEY, reference: "MTN-20260703-778", datePaiement: d("2026-07-03") },
        },
        {
            id: "seed-ech-3-2",
            contratId: contrat3.id,
            dateEcheance: d("2026-08-01"),
            montantLoyer: 75_000,
            montantCharges: 5_000,
            facture: { id: "seed-fac-5", numero: "FAC-2026-000005", penalites: 0, avisEnvoye: true, avisEnvoyeAt: d("2026-07-27") },
            paiement: { id: "seed-pm-3", mode: ModePaiement.MOBILE_MONEY, reference: "MTN-20260802-441", datePaiement: d("2026-08-02") },
        },
        {
            id: "seed-ech-3-3",
            contratId: contrat3.id,
            dateEcheance: d("2026-09-01"),
            montantLoyer: 75_000,
            montantCharges: 5_000,
            facture: { id: "seed-fac-6", numero: "FAC-2026-000006", penalites: 0, avisEnvoye: true, avisEnvoyeAt: d("2026-08-27") },
            paiement: { id: "seed-pm-4", mode: ModePaiement.VIREMENT_BANCAIRE, reference: "VIR-20260903-119", datePaiement: d("2026-09-03") },
        },
        // Contrat 4 (Marc Talla) — séjour meublé de 3 nuitées, payé
        {
            id: "seed-ech-4-1",
            contratId: contrat4.id,
            dateEcheance: d("2026-09-25"),
            montantLoyer: 75_000,
            montantCharges: 0,
            facture: { id: "seed-fac-7", numero: "FAC-2026-000007", penalites: 0, avisEnvoye: false },
            paiement: { id: "seed-pm-5", mode: ModePaiement.ESPECES, reference: "REC-000098", datePaiement: d("2026-09-25") },
        },
    ];

    for (const item of echeances) {
        const montantTotal = item.montantLoyer + item.montantCharges;
        const isPaid = !!item.paiement;
        const soldeRestant = isPaid ? 0 : montantTotal + item.facture.penalites;

        const echeance = await prisma.echeanceLoyer.upsert({
            where: { id: item.id },
            update: {},
            create: {
                id: item.id,
                organizationId: organization.id,
                contratId: item.contratId,
                dateEcheance: item.dateEcheance,
                montantLoyer: item.montantLoyer,
                montantCharges: item.montantCharges,
                montantTotal: montantTotal + item.facture.penalites,
                soldeRestant,
                estPaye: isPaid,
            },
        });

        await prisma.facture.upsert({
            where: { id: item.facture.id },
            update: {},
            create: {
                id: item.facture.id,
                organizationId: organization.id,
                numero: item.facture.numero,
                echeanceId: echeance.id,
                montant: montantTotal,
                penalites: item.facture.penalites,
                totalDu: montantTotal + item.facture.penalites,
                estSoldee: isPaid,
                avisEnvoye: item.facture.avisEnvoye,
                avisEnvoyeAt: item.facture.avisEnvoyeAt,
            },
        });

        if (item.paiement) {
            await prisma.paiement.upsert({
                where: { id: item.paiement.id },
                update: {},
                create: {
                    id: item.paiement.id,
                    organizationId: organization.id,
                    factureId: item.facture.id,
                    echeanceId: echeance.id,
                    userId: admin.id,
                    mode: item.paiement.mode,
                    montant: montantTotal,
                    reference: item.paiement.reference,
                    datePaiement: item.paiement.datePaiement,
                },
            });
        }

        if (item.relances) {
            for (const relance of item.relances) {
                await prisma.relance.upsert({
                    where: { id: relance.id },
                    update: {},
                    create: {
                        id: relance.id,
                        organizationId: organization.id,
                        echeanceId: echeance.id,
                        niveau: relance.niveau,
                        dateEnvoi: relance.dateEnvoi,
                    },
                });
            }
        }
    }

    // ---------------------------------------------------------------
    // Incidents
    // ---------------------------------------------------------------

    await prisma.incident.upsert({
        where: { id: "seed-incident-1" },
        update: {},
        create: {
            id: "seed-incident-1",
            organizationId: organization.id,
            titre: "Fuite d'eau salle de bain",
            description: "Fuite constatée sous l'évier de la salle de bain, intervention urgente nécessaire.",
            priorite: PrioriteIncident.HAUTE,
            statut: StatutIncident.NOUVEAU,
            uniteId: unite1.id,
        },
    });

    await prisma.incident.upsert({
        where: { id: "seed-incident-2" },
        update: {},
        create: {
            id: "seed-incident-2",
            organizationId: organization.id,
            titre: "Peinture écaillée hall d'entrée",
            description: "La peinture du hall commun s'écaille par endroits, à reprendre.",
            priorite: PrioriteIncident.BASSE,
            statut: StatutIncident.EN_COURS,
            immeubleId: imm1.id,
        },
    });

    console.log("Seed terminé :");
    console.log(`  SUPER_ADMIN : ${superAdmin.email} / ${SEED_PASSWORD}`);
    console.log(`  Organisation : ${organization.nom} (${organization.id})`);
    console.log(`  ADMIN : ${admin.email} / ${SEED_PASSWORD}`);
    console.log(`  DIRECTEUR_GENERAL : ${dg.email} / ${SEED_PASSWORD}`);
    console.log(
        `  Données : 2 propriétaires, 2 immeubles, 5 unités, 4 locataires, 4 contrats, ${echeances.length} échéances/factures, incidents`
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
