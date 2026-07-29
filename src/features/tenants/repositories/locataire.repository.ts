import { TypeLocataire } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { LocataireFormValues } from "@/features/tenants/schemas/tenant.schema";

const LOCATAIRE_SELECT = {
    id: true,
    type: true,
    nom: true,
    prenom: true,
    dateNaissance: true,
    profession: true,
    telephone: true,
    email: true,
    adresse: true,
    pieceIdentite: true,
    revenuMensuelMoyen: true,
    raisonSociale: true,
    rccm: true,
    niu: true,
    telephoneMoral: true,
    emailMoral: true,
    createdAt: true,
} as const;

export class LocataireRepository {
    static async create(organizationId: string, data: LocataireFormValues) {
        const isPhysique = data.type === TypeLocataire.PHYSIQUE;

        return prisma.locataire.create({
            data: {
                organizationId,
                type: data.type,
                nom: data.nom,
                prenom: data.prenom,
                telephone: data.telephone,
                email: data.email,
                adresse: data.adresse,
                pieceIdentite: data.pieceIdentite,
                dateNaissance: isPhysique ? data.dateNaissance : undefined,
                profession: isPhysique ? data.profession : undefined,
                revenuMensuelMoyen: isPhysique ? data.revenuMensuelMoyen : undefined,
                raisonSociale: !isPhysique ? data.raisonSociale : undefined,
                rccm: !isPhysique ? data.rccm : undefined,
                niu: !isPhysique ? data.niu : undefined,
                telephoneMoral: !isPhysique ? data.telephoneMoral : undefined,
                emailMoral: !isPhysique ? data.emailMoral : undefined,
            },
            select: LOCATAIRE_SELECT,
        });
    }

    static async findAll(organizationId: string) {
        return prisma.locataire.findMany({
            where: { organizationId },
            select: LOCATAIRE_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findAllOptions(organizationId: string) {
        return prisma.locataire.findMany({
            where: { organizationId },
            select: { id: true, nom: true, prenom: true, raisonSociale: true },
            orderBy: { nom: "asc" },
        });
    }
}
