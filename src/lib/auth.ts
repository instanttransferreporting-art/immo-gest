import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthService } from "@/features/auth/services/auth.service";
import { loginSchema } from "@/features/auth/schemas/login.schema";
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
                    email: user.email,
                    name: `${user.prenom} ${user.nom}`,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }

            return session;
        },
    },
};

export function getCurrentSession() {
    return getServerSession(authOptions);
}
