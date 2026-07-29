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
    static async register(input: RegisterUserInput, client?: Prisma.TransactionClient): Promise<UserDTO> {
        const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

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
