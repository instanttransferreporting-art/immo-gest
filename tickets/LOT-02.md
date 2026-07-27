# LOT-02 : Gestion du Patrimoine Immobilier (Propriétaires & Immeubles)

## 1. Objectif
Permettre aux Gestionnaires d'enregistrer les propriétaires et de créer des immeubles avec une référence générée automatiquement.

## 2. Dépendances
- LOT-01 (Authentification)

## 3. Sous-tâches
- **02.1 - Propriétaire (Types & Data)** : Créer `property.types.ts`, `property.schema.ts` (validation stricte emails/téléphones), `proprietaire.repository.ts` et `proprietaire.service.ts`.
- **02.2 - Immeuble (Logique Métier)** : Créer `immeuble.repository.ts` et `immeuble.service.ts`. Le service doit inclure la logique de génération automatique de la référence (ex: `IMM-2026-0001`).
- **02.3 - Server Actions** : Créer `proprietaire.actions.ts` et `immeuble.actions.ts` retournant des `ActionResponse<T>`.
- **02.4 - UI Propriétaire** : Créer `ProprietaireForm.tsx` permettant d'ajouter dynamiquement des numéros de téléphone (+) et des emails pro.
- **02.5 - UI Immeuble** : Créer `ImmeubleForm.tsx` (avec sélection du propriétaire) et `ImmeublesTable.tsx` pour lister le patrimoine.

## 4. Critères d'acceptation
- [ ] La validation Zod bloque l'envoi si le téléphone n'a pas le bon format (Cameroun par défaut).
- [ ] Un propriétaire peut avoir plusieurs téléphones et emails.
- [ ] À la création d'un immeuble, la référence est générée automatiquement côté serveur.
- [ ] L'interface affiche les erreurs Zod en rouge clignotant sous les champs.