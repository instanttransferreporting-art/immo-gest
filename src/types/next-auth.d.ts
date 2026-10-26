import type { Locale, RoleType } from "@/generated/prisma/enums";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            organizationId: string | null;
            role: RoleType;
            locale: Locale;
            impersonatedOrganizationId: string | null;
            impersonatedOrganizationNom: string | null;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        organizationId: string | null;
        role: RoleType;
        locale: Locale;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        organizationId: string | null;
        role: RoleType;
        locale: Locale;
        impersonatedOrganizationId: string | null;
        impersonatedOrganizationNom: string | null;
    }
}
