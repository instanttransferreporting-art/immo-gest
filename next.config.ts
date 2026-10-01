import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma Client est généré dans un dossier personnalisé (src/generated/prisma),
  // pas l'emplacement par défaut (node_modules/.prisma/client). Le traceur de
  // fichiers de Next.js ne détecte pas toujours les binaires moteur (.so.node)
  // dans ce cas, ce qui fait planter Prisma au runtime sur Vercel
  // ("could not locate the Query Engine"). On force leur inclusion explicite.
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
