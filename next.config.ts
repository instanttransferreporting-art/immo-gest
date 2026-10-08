import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Téléversement des pièces de bail (10 Mo max côté métier + marge multipart).
    serverActions: { bodySizeLimit: "12mb" },
  },
  // Prisma Client est généré dans un dossier personnalisé (src/generated/prisma),
  // pas l'emplacement par défaut (node_modules/.prisma/client). Le traceur de
  // fichiers de Next.js ne détecte pas toujours les binaires moteur (.so.node)
  // dans ce cas, ce qui fait planter Prisma au runtime sur Vercel
  // ("could not locate the Query Engine"). On force leur inclusion explicite.
  outputFileTracingIncludes: {
    // "/*": ["./src/generated/prisma/**/*"],
    "/**/*": ["./src/generated/prisma/**/*"],
    // Modèle Word du bail, lu au runtime par la génération des contrats.
    "/api/contrats/**/*": ["./src/features/leases/templates/**/*"],
  },
};

export default nextConfig;
