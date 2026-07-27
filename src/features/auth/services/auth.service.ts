import bcrypt from "bcryptjs";

import { UserRepository } from "@/features/auth/repositories/user.repository";
import type { LoginCredentials, UserDTO } from "@/features/auth/types/auth.types";

export class AuthService {
    static async authenticate({ email, password }: LoginCredentials): Promise<UserDTO | null> {
        const user = await UserRepository.findByEmail(email);

        if (!user || !user.isActive) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            isActive: user.isActive,
        };
    }
}
