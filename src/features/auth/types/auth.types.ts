import type { RoleType } from "@/generated/prisma/enums";

export type UserDTO = Readonly<{
    id: string;
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
