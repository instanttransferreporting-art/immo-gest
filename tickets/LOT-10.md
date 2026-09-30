# LOT-10 : Refactoring Multi-Tenant et Sécurité (RBAC)

## 1. Objectif
Garantir l'isolation totale des données par client (Multi-Tenant) et restreindre l'accès aux fonctionnalités selon le rôle de l'utilisateur (Admin, Gestionnaire, Comptable, DG).

## 2. Dépendances
- LOT-01 à LOT-09

## 3. Sous-tâches
- **10.1 - Schéma Prisma (Multi-Tenant)** : Créer le modèle `Organization`. Ajouter le champ `organizationId` comme clé étrangère obligatoire sur TOUS les modèles principaux (`User`, `Proprietaire`, `Immeuble`, `Contrat`, `Facture`, etc.). Générer la migration.
- **10.2 - Sécurisation des Repositories** : Mettre à jour TOUS les repositories existants pour qu'ils incluent systématiquement `where: { organizationId: currentOrgId }` dans chaque requête.
- **10.3 - Matrice des Permissions (RBAC)** : Créer `constants/permissions.ts` définissant les droits. Exemple : un Comptable ne peut pas créer d'Immeuble, un Gestionnaire ne peut pas valider un reversement.
- **10.4 - Middleware & Guards** : Créer des fonctions utilitaires (`checkPermission`) à utiliser dans les Server Actions pour bloquer les requêtes non autorisées.
- **10.5 - UI Organisation** : Créer la page des paramètres de l'entreprise (`/dashboard/organization`) pour gérer les infos de l'agence (Nom, Logo, Taux de commission par défaut).

## 4. Critères d'acceptation
- [ ] Le schéma Prisma ne permet plus de créer une entité métier sans `organizationId`.
- [ ] Un utilisateur ne peut voir que les données de sa propre `Organization`.
- [ ] Les Server Actions renvoient une erreur `403 Forbidden` si le rôle de l'utilisateur n'a pas la permission requise.