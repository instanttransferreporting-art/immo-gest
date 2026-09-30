import type { RoleType } from "@/generated/prisma/enums";

export type UserDTO = Readonly<{
    id: string;
    organizationId: string | null;
    email: string;
    nom: string;
    prenom: string;
    role: RoleType;
    isActive: boolean;
}>;

export type LoginCredentials = Readonly<{
    email: string;
    password: string;
}>;

export type RegisterUserInput = Readonly<{
    organizationId: string;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: RoleType;
}>;
