# LOT-20 : Règles de Dates de Fin de Contrat (Alignement Fiscal 31 Décembre)

## 1. Objectif
Appliquer automatiquement la règle métier du cahier des charges (§5) : le premier contrat d'un locataire se termine le 31 décembre de l'année en cours, puis chaque contrat suivant s'étale du 1er janvier au 31 décembre.

## 2. Dépendances
- LOT-04 (Contrats), LOT-15 (Calculateur flexible / baux meublés)

## 3. Sous-tâches
- **20.1 - Règle du premier contrat** : pour un nouveau contrat sur un bail classique (non meublé, fréquence ≠ QUOTIDIEN), calculer automatiquement `dateFin` au 31 décembre de l'année de `dateDebut`.
- **20.2 - Règle des contrats suivants** : lors d'un renouvellement (LOT-21), la nouvelle période va automatiquement du 1er janvier au 31 décembre de l'année suivante.
- **20.3 - Exception baux meublés/nuitée** : conserver une `dateFin` librement définie par l'utilisateur pour les unités meublées ou les contrats à la nuitée (cohérent avec LOT-15).
- **20.4 - UI** : rendre le champ Date de fin en lecture seule (calculé, avec explication) pour les baux classiques dans `ContratForm`, tout en le laissant modifiable pour les baux meublés/nuitée.

## 4. Critères d'acceptation
- [ ] Un nouveau contrat classique voit sa date de fin calculée et fixée automatiquement au 31 décembre de l'année de début, sans action de l'utilisateur.
- [ ] Les baux à la nuitée ou meublés conservent une date de fin librement définie.
- [ ] La règle ne casse pas le calcul du prorata temporis déjà en place (LOT-04).
