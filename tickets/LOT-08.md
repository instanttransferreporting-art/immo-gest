# LOT-08 : Gestion des Incidents (Ticketing)

## 1. Objectif
Permettre le suivi des pannes, des réparations et des interventions (plomberie, électricité, etc.) signalées par les locataires ou les gestionnaires sur une Unité ou un Immeuble.

## 2. Dépendances
- LOT-03 (Unités & Locataires)

## 3. Sous-tâches
- **08.1 - Types & Schemas** : Créer `incident.types.ts` et `incident.schema.ts`. Un incident a un titre, une description, une priorité (BASSE, MOYENNE, HAUTE), un statut (NOUVEAU, EN_COURS, RESOLU), et peut être lié à une `Unite` ou un `Immeuble`.
- **08.2 - Backend (Repository & Service)** : Créer `incident.repository.ts` et `incident.service.ts`.
- **08.3 - Server Actions** : Créer `incident.actions.ts` pour la création, la modification du statut, et l'assignation (optionnelle) d'un prestataire.
- **08.4 - UI Liste (Kanban ou Tableau)** : Créer `IncidentsBoard.tsx` (vue Kanban si possible avec Shadcn, sinon un tableau avec des badges de couleur pour les statuts) filtrable par immeuble.
- **08.5 - UI Formulaire** : Créer `IncidentForm.tsx` pour déclarer une nouvelle panne avec possibilité de sélectionner l'unité concernée.

## 4. Critères d'acceptation
- [ ] Les statuts des incidents sont visuellement distincts (badges de couleurs différentes).
- [ ] Il est possible de filtrer les incidents par statut ("NOUVEAU" et "EN_COURS") pour voir rapidement ce qui nécessite une action.
- [ ] La validation Zod empêche la création d'un incident sans titre ou sans niveau de priorité.