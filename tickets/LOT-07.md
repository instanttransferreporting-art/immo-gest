# LOT-07 : Reversements Propriétaires et Frais d'Agence

## 1. Objectif
Calculer et générer les rapports de reversement (reddition de comptes) pour les propriétaires, en déduisant automatiquement la commission de l'agence sur les loyers encaissés.

## 2. Dépendances
- LOT-06 (Encaissements)

## 3. Sous-tâches
- **07.1 - Configuration Agence (Backend)** : Ajouter un champ `tauxCommission` (ex: 8%) dans le modèle `Organization` ou `Proprietaire` via le `schema.prisma`, et mettre à jour les types/schemas associés.
- **07.2 - Logique de Calcul (Service)** : Créer `reversement.service.ts`. Ajouter une fonction qui prend un propriétaire et une période (mois/année), additionne tous les loyers *encaissés* de ses immeubles, déduit le pourcentage de commission, et calcule le net à reverser.
- **07.3 - Server Actions** : Créer `reversement.actions.ts` pour générer et valider un reversement.
- **07.4 - UI Bilan Propriétaire** : Créer la page `app/dashboard/proprietaires/[id]/bilan/page.tsx`. Afficher un tableau clair : Total Encaissé - Frais d'Agence = Net à payer.
- **07.5 - Export/Impression** : Créer un composant `CompteRenduGestion.tsx` (UI) formaté pour l'impression, servant de justificatif financier au propriétaire.

## 4. Critères d'acceptation
- [ ] Le calcul du reversement se base uniquement sur les factures ayant le statut "PAYEE" ou les paiements partiels encaissés, et non sur les factures "EN_ATTENTE".
- [ ] La commission de l'agence est déduite avec précision du montant brut.
- [ ] L'interface permet d'exporter ou d'imprimer le compte rendu de gestion de manière lisible.