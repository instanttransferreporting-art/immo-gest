# LOT-05 : Facturation et Avis d'Échéance

## 1. Objectif
Générer automatiquement ou manuellement les factures (loyers + charges) pour les contrats actifs à chaque cycle de facturation.

## 2. Dépendances
- LOT-04 (Contrats de Bail)

## 3. Sous-tâches
- **05.1 - Types & Schemas** : Créer `facture.types.ts` et `facture.schema.ts`. Une facture doit avoir un statut (EN_ATTENTE, PAYEE, PARTIEL), un mois de référence, un montant loyer, un montant charges, et un total.
- **05.2 - Génération de Facture (Service)** : Créer `facture.service.ts`. Ajouter une méthode `genererFactureMensuelle(contratId, mois, annee)` qui lit les conditions du contrat et crée la facture correspondante.
- **05.3 - Action de Facturation en Masse** : Créer `facture.actions.ts`. Ajouter une Server Action permettant de générer les factures pour *tous* les contrats actifs d'une organisation pour un mois donné (batch processing).
- **05.4 - UI Liste des Factures** : Créer `FacturesTable.tsx` avec des filtres par statut (Payé, En attente) et par mois.
- **05.5 - UI Génération** : Créer un composant ou un bouton permettant de déclencher la facturation du mois en cours avec un indicateur de chargement.

## 4. Critères d'acceptation
- [ ] Une facture ne peut pas être générée en double pour le même contrat et le même mois de référence.
- [ ] Le montant total de la facture correspond exactement au Loyer + Charges définis dans le contrat.
- [ ] La génération en masse traite uniquement les contrats dont le statut est "ACTIF".