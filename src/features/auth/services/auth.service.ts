import bcrypt from "bcryptjs";

import { Prisma } from "@/generated/prisma/client";
import { UserRepository } from "@/features/auth/repositories/user.repository";
import type { LoginCredentials, RegisterUserInput, UserDTO } from "@/features/auth/types/auth.types";

const PASSWORD_SALT_ROUNDS = 10;
const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export class EmailAlreadyUsedError extends Error {
    constructor() {
        super("Cet email est déjà utilisé.");
        this.name = "EmailAlreadyUsedError";
    }
}

export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    }

    static async register(input: RegisterUserInput, client?: Prisma.TransactionClient): Promise<UserDTO> {
        const passwordHash = await AuthService.hashPassword(input.password);

        try {
            return await UserRepository.create(
                {
                    organizationId: input.organizationId,
                    nom: input.nom,
                    prenom: input.prenom,
                    email: input.email,
                    passwordHash,
                    role: input.role,
                },
                client
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
                throw new EmailAlreadyUsedError();
            }

            throw error;
        }
    }

    /**
     * État à jour d'un compte déjà connecté, relu à chaque lecture de session :
     * retourne null si le compte (ou son entreprise) a été désactivé entre-temps,
     * sinon son rôle et son entreprise actuels (un changement de rôle s'applique sans reconnexion).
     */
    static async getActiveSessionState(
        userId: string
    ): Promise<Pick<UserDTO, "organizationId" | "role"> | null> {
        const user = await UserRepository.findSessionStateById(userId);

        if (!user || !user.isActive || (user.organization && !user.organization.isActive)) {
            return null;
        }

        return { organizationId: user.organizationId, role: user.role };
    }

    static async authenticate({ email, password }: LoginCredentials): Promise<UserDTO | null> {
        const user = await UserRepository.findByEmail(email);

        if (!user || !user.isActive) {
            return null;
        }

        if (user.organization && !user.organization.isActive) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return {
            id: user.id,
            organizationId: user.organizationId,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            isActive: user.isActive,
        };
    }
}
