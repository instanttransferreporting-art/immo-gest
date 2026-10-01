import type { RoleType } from "@/generated/prisma/enums";

export type TeamMemberDTO = Readonly<{
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: RoleType;
    isActive: boolean;
    createdAt: Date;
}>;
