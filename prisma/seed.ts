import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { RoleType } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

const PASSWORD_SALT_ROUNDS = 10;
const SEED_PASSWORD = "Test1234!";

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
        where: { id: "00000000-0000-0000-0000-000000000001" },
        update: {},
        create: {
            id: "00000000-0000-0000-0000-000000000001",
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

    console.log("Seed terminé :");
    console.log(`  SUPER_ADMIN : ${superAdmin.email} / ${SEED_PASSWORD}`);
    console.log(`  Organisation : ${organization.nom} (${organization.id})`);
    console.log(`  ADMIN : ${admin.email} / ${SEED_PASSWORD}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
