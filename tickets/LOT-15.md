# LOT-15 : Unités Dynamiques, Meublés & Édition globale (CRUD)

## 1. Objectif
Gérer la flexibilité des types de biens (résidences meublées vs baux classiques) et autoriser l'édition complète des entités.

## 2. Dépendances
- LOT-02 (Immeubles/Unités), LOT-03 (Locataires)

## 3. Sous-tâches
- **15.1 - Schéma Unité & Tarification** :
    - Rendre `TypeUnite` dynamique (créable par l'agence).
    - Ajouter le tag `isMeuble` (Boolean).
    - Ajouter l'enum `FrequencePaiement` : `NUITEE`, `HEBDOMADAIRE`, `MENSUEL`, `TRIMESTRIEL`, `ANNUEL`, `AUTRE` (avec champ texte libre `frequenceAutreTexte`).
- **15.2 - Modals d'Édition (CRUD)** :
    - Implémenter les formulaires de mise à jour (Update) et de visualisation de details (READ) pour : Immeuble, Unité, et Locataire.
- **15.3 - Calculateur de Contrat Flexible** :
    - Pour les baux meublés/courte durée : Calcul automatique ($N \text{ nuitées} \times \text{Tarif}$).
    - Conserver un champ permettant d'écraser manuellement le montant total calculé lors de la rédaction du contrat.

## 4. Critères d'acceptation
- [ ] Une agence peut spécifier si une unité se loue à la nuitée ou au mois.
- [ ] Les données des locataires et des unités peuvent être modifiées après leur création.