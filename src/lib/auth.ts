import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthService } from "@/features/auth/services/auth.service";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { OrganizationService } from "@/features/organizations/services/organization.service";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: ROUTES.LOGIN,
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const user = await AuthService.authenticate(parsed.data);

                if (!user) {
                    return null;
                }

                return {
                    id: user.id,
                    organizationId: user.organizationId,
                    email: user.email,
                    name: `${user.prenom} ${user.nom}`,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.organizationId = user.organizationId;
                token.role = user.role;
                token.impersonatedOrganizationId = null;
                token.impersonatedOrganizationNom = null;
            }

            if (trigger === "update" && session && token.role === RoleType.SUPER_ADMIN) {
                if (session.impersonatedOrganizationId === null) {
                    token.impersonatedOrganizationId = null;
                    token.impersonatedOrganizationNom = null;
                } else if (typeof session.impersonatedOrganizationId === "string") {
                    const organization = await OrganizationService.getById(session.impersonatedOrganizationId);

                    if (organization && organization.isActive) {
                        token.impersonatedOrganizationId = organization.id;
                        token.impersonatedOrganizationNom = organization.nom;
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.organizationId = token.organizationId;
                session.user.role = token.role;
                session.user.impersonatedOrganizationId = token.impersonatedOrganizationId ?? null;
                session.user.impersonatedOrganizationNom = token.impersonatedOrganizationNom ?? null;
            }

            return session;
        },
    },
};

export function getCurrentSession() {
    return getServerSession(authOptions);
}

export class UnauthenticatedError extends Error {
    constructor() {
        super("Vous devez être connecté pour effectuer cette action.");
        this.name = "UnauthenticatedError";
    }
}

export class NoOrganizationContextError extends Error {
    constructor() {
        super("Cette action nécessite un compte rattaché à une entreprise.");
        this.name = "NoOrganizationContextError";
    }
}

/**
 * Resolves the organizationId of the currently authenticated user — the
 * impersonated organization takes priority when a SUPER_ADMIN has switched
 * into an entreprise's session. Throws if there is no session, or if the
 * session belongs to a SUPER_ADMIN who isn't impersonating (platform-level
 * account with no organizationId) — callers should already be behind an
 * auth check (e.g. checkPermission) by the time they need the tenant scope.
 */
export async function getCurrentOrganizationId(): Promise<string> {
    const session = await getCurrentSession();

    if (!session) {
        throw new UnauthenticatedError();
    }

    const organizationId = session.user.impersonatedOrganizationId ?? session.user.organizationId;

    if (!organizationId) {
        throw new NoOrganizationContextError();
    }

    return organizationId;
}

/**
 * Same resolution as `getCurrentOrganizationId`, but derived from an already-fetched
 * session user (e.g. the value returned by `checkPermission`) instead of re-fetching
 * the session — for use in Server Actions that already hold that object.
 */
export function effectiveOrganizationId(user: Session["user"]): string {
    const organizationId = user.impersonatedOrganizationId ?? user.organizationId;

    if (!organizationId) {
        throw new NoOrganizationContextError();
    }

    return organizationId;
}
