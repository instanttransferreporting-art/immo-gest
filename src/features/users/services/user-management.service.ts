import { RoleType } from "@/generated/prisma/enums";
import { AuthService } from "@/features/auth/services/auth.service";
import { UserManagementRepository } from "@/features/users/repositories/user-management.repository";
import type {
    CreateUserFormValues,
    UpdateUserFormValues,
} from "@/features/users/schemas/user.schema";
import type { TeamMemberDTO } from "@/features/users/types/user.types";

export class UserNotFoundError extends Error {
    constructor() {
        super("Cet utilisateur est introuvable.");
        this.name = "UserNotFoundError";
    }
}

export class SelfModificationError extends Error {
    constructor() {
        super("Vous ne pouvez pas modifier votre propre rôle ni désactiver votre propre compte.");
        this.name = "SelfModificationError";
    }
}

export class LastAdminError extends Error {
    constructor() {
        super("L'entreprise doit conserver au moins un administrateur actif.");
        this.name = "LastAdminError";
    }
}

/**
 * Gestion de l'équipe d'une entreprise par son ADMIN.
 * `actorId` est l'utilisateur connecté qui agit (un SUPER_ADMIN en impersonation
 * n'est jamais membre de l'équipe, la protection "soi-même" ne le concerne donc pas).
 */
export class UserManagementService {
    static async list(organizationId: string): Promise<TeamMemberDTO[]> {
        return UserManagementRepository.findAllByOrganization(organizationId);
    }

    static async create(organizationId: string, input: CreateUserFormValues): Promise<TeamMemberDTO> {
        const user = await AuthService.register({
            organizationId,
            nom: input.nom,
            prenom: input.prenom,
            email: input.email,
            password: input.password,
            role: input.role,
        });

        const created = await UserManagementRepository.findByIdInOrganization(user.id, organizationId);

        if (!created) {
            throw new UserNotFoundError();
        }

        return created;
    }

    static async update(
        organizationId: string,
        userId: string,
        input: UpdateUserFormValues,
        actorId: string
    ): Promise<TeamMemberDTO> {
        const user = await UserManagementService.getOrThrow(organizationId, userId);

        if (input.role !== user.role) {
            if (userId === actorId) {
                throw new SelfModificationError();
            }

            if (user.role === RoleType.ADMIN && user.isActive) {
                await UserManagementService.assertNotLastAdmin(organizationId);
            }
        }

        return UserManagementRepository.update(userId, {
            nom: input.nom,
            prenom: input.prenom,
            role: input.role,
        });
    }

    static async setActive(
        organizationId: string,
        userId: string,
        isActive: boolean,
        actorId: string
    ): Promise<TeamMemberDTO> {
        const user = await UserManagementService.getOrThrow(organizationId, userId);

        if (!isActive) {
            if (userId === actorId) {
                throw new SelfModificationError();
            }

            if (user.role === RoleType.ADMIN && user.isActive) {
                await UserManagementService.assertNotLastAdmin(organizationId);
            }
        }

        return UserManagementRepository.update(userId, { isActive });
    }

    static async resetPassword(organizationId: string, userId: string, password: string): Promise<TeamMemberDTO> {
        await UserManagementService.getOrThrow(organizationId, userId);

        const passwordHash = await AuthService.hashPassword(password);

        return UserManagementRepository.updatePasswordHash(userId, passwordHash);
    }

    private static async getOrThrow(organizationId: string, userId: string): Promise<TeamMemberDTO> {
        const user = await UserManagementRepository.findByIdInOrganization(userId, organizationId);

        if (!user) {
            throw new UserNotFoundError();
        }

        return user;
    }

    /** Appelé avant de retirer un ADMIN actif : refuse si c'est le dernier. */
    private static async assertNotLastAdmin(organizationId: string): Promise<void> {
        const activeAdmins = await UserManagementRepository.countActiveAdmins(organizationId);

        if (activeAdmins <= 1) {
            throw new LastAdminError();
        }
    }
}
