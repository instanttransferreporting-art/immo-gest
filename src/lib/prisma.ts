import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// Le pooler Supabase en mode "session" (port 5432) plafonne à 15 clients pour
// tout le projet (dev local + déploiements) : on borne le pool par instance.
const DEFAULT_POOL_MAX = 3;

function createPrismaClient() {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.DATABASE_POOL_MAX) || DEFAULT_POOL_MAX,
        idleTimeoutMillis: 10_000,
    });

    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
