# LOT-03 : Unités Locatives et Locataires

## 1. Objectif
Détailler les immeubles en Unités (Appartements, Bureaux...) et enregistrer les fiches locataires (physiques ou morales) avec archivage documentaire.

## 2. Dépendances
- LOT-02 (Immeubles)

## 3. Sous-tâches
- **03.1 - Unités (Backend)** : Créer les schemas, le repository et le service pour la gestion des `Unite`. Gérer les charges (Forfaitaire vs Pourcentage).
- **03.2 - Locataires (Backend)** : Créer les schemas (séparation claire entre `TypeLocataire.PHYSIQUE` et `MORALE`), repository et service.
- **03.3 - UI Unités** : Créer `UniteForm.tsx` (rattaché à un immeuble) et l'affichage des unités d'un immeuble.
- **03.4 - UI Locataires** : Créer `LocataireForm.tsx`. Le formulaire doit changer dynamiquement selon si l'on choisit Personne Physique (revenu obligatoire) ou Personne Morale (infos de l'entreprise + infos du représentant légal).
- **03.5 - Archivage (Service)** : Mettre en place un service basique (`document.service.ts`) pour gérer l'upload des pièces obligatoires (CNI, Photo) associées à un locataire.

## 4. Critères d'acceptation
- [ ] Le type de charges d'une unité modifie correctement le calcul (montant fixe vs % du loyer).
- [ ] Si le locataire est une "Personne Physique", le champ "Revenu mensuel moyen" est obligatoire.
- [ ] Si le locataire est une "Personne Morale", les champs RCCM et NIU sont obligatoires.
- [ ] Le dossier documentaire refuse la validation si les 5 pièces obligatoires ne sont pas fournies à la création.