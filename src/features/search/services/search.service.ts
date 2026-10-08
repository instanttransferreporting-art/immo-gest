import { getCurrentOrganizationId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/constants/routes";
import type { SearchResultDTO } from "@/features/search/types/search.types";

const MAX_PER_GROUP = 5;

export const SEARCH_MIN_LENGTH = 2;

const contains = (value: string) => ({ contains: value, mode: "insensitive" as const });

export class SearchService {
    /** Recherche globale (immeubles, unités, locataires, contrats, propriétaires) limitée à l'organisation courante. */
    static async search(rawQuery: string): Promise<SearchResultDTO[]> {
        const query = rawQuery.trim();

        if (query.length < SEARCH_MIN_LENGTH) {
            return [];
        }

        const organizationId = await getCurrentOrganizationId();

        const [immeubles, unites, locataires, contrats, proprietaires] = await Promise.all([
            prisma.immeuble.findMany({
                where: {
                    organizationId,
                    OR: [
                        { nom: contains(query) },
                        { adresse: contains(query) },
                        { ville: contains(query) },
                        { reference: contains(query) },
                    ],
                },
                select: { id: true, nom: true, adresse: true, ville: true },
                orderBy: { nom: "asc" },
                take: MAX_PER_GROUP,
            }),
            prisma.unite.findMany({
                where: { organizationId, numero: contains(query) },
                select: { id: true, numero: true, immeuble: { select: { id: true, nom: true } } },
                orderBy: { numero: "asc" },
                take: MAX_PER_GROUP,
            }),
            prisma.locataire.findMany({
                where: {
                    organizationId,
                    OR: [
                        { nom: contains(query) },
                        { prenom: contains(query) },
                        { raisonSociale: contains(query) },
                        { email: contains(query) },
                        { telephone: contains(query) },
                        { pieceIdentite: contains(query) },
                    ],
                },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    raisonSociale: true,
                    telephone: true,
                    // Pas de fiche locataire dédiée : on ouvre son contrat le plus récent.
                    contrats: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 },
                },
                orderBy: { nom: "asc" },
                take: MAX_PER_GROUP,
            }),
            prisma.contratBail.findMany({
                where: {
                    organizationId,
                    OR: [
                        { numeroContrat: contains(query) },
                        { locataire: { nom: contains(query) } },
                        { locataire: { prenom: contains(query) } },
                        { locataire: { raisonSociale: contains(query) } },
                        { unite: { numero: contains(query) } },
                    ],
                },
                select: {
                    id: true,
                    numeroContrat: true,
                    locataire: { select: { nom: true, prenom: true, raisonSociale: true } },
                    unite: { select: { numero: true, immeuble: { select: { nom: true } } } },
                },
                orderBy: { createdAt: "desc" },
                take: MAX_PER_GROUP,
            }),
            prisma.proprietaire.findMany({
                where: { organizationId, OR: [{ nom: contains(query) }, { prenom: contains(query) }] },
                select: { id: true, nom: true, prenom: true, ville: true },
                orderBy: { nom: "asc" },
                take: MAX_PER_GROUP,
            }),
        ]);

        return [
            ...immeubles.map(
                (immeuble): SearchResultDTO => ({
                    id: immeuble.id,
                    group: "IMMEUBLE",
                    title: immeuble.nom,
                    subtitle: `${immeuble.adresse}, ${immeuble.ville}`,
                    href: `${ROUTES.PROPERTIES}/${immeuble.id}`,
                })
            ),
            ...unites.map(
                (unite): SearchResultDTO => ({
                    id: unite.id,
                    group: "UNITE",
                    title: `${unite.immeuble.nom} — ${unite.numero}`,
                    subtitle: "Unité",
                    href: `${ROUTES.PROPERTIES}/${unite.immeuble.id}`,
                })
            ),
            ...locataires.map(
                (locataire): SearchResultDTO => ({
                    id: locataire.id,
                    group: "LOCATAIRE",
                    title: locataire.raisonSociale ?? `${locataire.nom} ${locataire.prenom}`.trim(),
                    subtitle: locataire.telephone,
                    href: locataire.contrats[0] ? `${ROUTES.LEASES}/${locataire.contrats[0].id}` : ROUTES.TENANTS,
                })
            ),
            ...contrats.map(
                (contrat): SearchResultDTO => ({
                    id: contrat.id,
                    group: "CONTRAT",
                    title: contrat.numeroContrat,
                    subtitle: `${contrat.locataire.raisonSociale ?? `${contrat.locataire.nom} ${contrat.locataire.prenom}`.trim()} · ${contrat.unite.immeuble.nom} — ${contrat.unite.numero}`,
                    href: `${ROUTES.LEASES}/${contrat.id}`,
                })
            ),
            ...proprietaires.map(
                (proprietaire): SearchResultDTO => ({
                    id: proprietaire.id,
                    group: "PROPRIETAIRE",
                    title: `${proprietaire.nom} ${proprietaire.prenom ?? ""}`.trim(),
                    subtitle: proprietaire.ville,
                    href: `/proprietaires/${proprietaire.id}/bilan`,
                })
            ),
        ];
    }
}
