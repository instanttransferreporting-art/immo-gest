# LOT-09 : Tableau de Bord (Dashboard Principal)

## 1. Objectif
Offrir au gestionnaire une vue d'ensemble immédiate de la santé de son parc immobilier à travers des indicateurs clés de performance (KPI) et des alertes.

## 2. Dépendances
- LOT-04 (Baux), LOT-05 (Facturation), LOT-06 (Encaissements), LOT-08 (Incidents)

## 3. Sous-tâches
- **09.1 - Types & Schemas** : Créer `dashboard.types.ts` pour structurer les données agrégées (ex: `DashboardMetricsDTO`).
- **09.2 - Service d'Agrégation** : Créer `dashboard.service.ts`. Implémenter les requêtes Prisma optimisées (`count`, `aggregate`, `groupBy`) pour calculer :
    - Le taux d'occupation (Unités occupées / Total unités)
    - Le total des impayés (Somme des factures EN_ATTENTE du mois précédent)
    - Le revenu mensuel encaissé
- **09.3 - Server Action** : Créer `dashboard.actions.ts` pour récupérer ces métriques de manière asynchrone côté client.
- **09.4 - UI KPIs (Cartes)** : Créer `KpiCards.tsx` affichant les chiffres clés en haut du dashboard (avec des icônes Lucide).
- **09.5 - UI Alertes & Graphiques** : Créer une section "À faire" listant les factures impayées urgentes et les incidents récents non résolus.

## 4. Critères d'acceptation
- [ ] Le tableau de bord charge rapidement (optimisation des requêtes Prisma avec `_count` et `_sum` sans ramener tous les objets en mémoire).
- [ ] Le taux d'occupation est calculé correctement sous forme de pourcentage (%).
- [ ] Les données affichées respectent strictement l'`organizationId` de l'utilisateur connecté (isolation multi-tenant).