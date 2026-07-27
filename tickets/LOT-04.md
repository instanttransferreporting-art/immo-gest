# LOT-04 : Contrats de Bail et Prorata Temporis

## 1. Objectif
Gérer la création des contrats de location en liant un Locataire, une Unité et des conditions financières, avec le calcul automatique du premier loyer (prorata temporis).

## 2. Dépendances
- LOT-02 (Immeubles & Unités)
- LOT-03 (Locataires)

## 3. Sous-tâches
- **04.1 - Types & Schemas** : Créer `contrat.types.ts` et `contrat.schema.ts`. Gérer les dates de début/fin, le montant du loyer de base, la caution, et la périodicité de paiement.
- **04.2 - Logique Métier (Prorata)** : Créer `contrat.service.ts`. Ce service DOIT inclure une fonction utilitaire (ex: `calculateProrata(dateDebut, loyerMensuel)`) pour calculer le montant exact du premier mois si le locataire entre en cours de mois.
- **04.3 - Repository & Actions** : Créer `contrat.repository.ts` et `contrat.actions.ts`. Mettre à jour le statut de l'`Unite` (passer de "LIBRE" à "OCCUPE") lors de la validation du contrat grâce à une transaction Prisma (`$transaction`).
- **04.4 - UI Formulaire** : Créer `ContratForm.tsx`. Ce formulaire doit inclure des sélecteurs (combobox ou select) pour choisir le Locataire et l'Unité libre. Afficher un aperçu dynamique du calcul du prorata et de la caution avant soumission.
- **04.5 - UI Liste & Détails** : Créer `ContratsTable.tsx` pour lister les baux actifs et résiliés.

## 4. Critères d'acceptation
- [ ] Il est impossible d'affecter une Unité déjà "OCCUPEE" à un nouveau contrat.
- [ ] Le calcul du prorata temporis s'affiche correctement et correspond au nombre de jours restants dans le mois d'entrée.
- [ ] Lors de la création, la transaction Prisma met bien à jour la table Contrat ET la table Unite.
- [ ] Les dates (début/fin) sont validées (la date de fin doit être postérieure à la date de début).