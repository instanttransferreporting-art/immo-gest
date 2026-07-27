import type { RoleType } from "@/generated/prisma/enums";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: RoleType;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: RoleType;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        role: RoleType;
    }
}
