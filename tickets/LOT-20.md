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
- [x] Un nouveau contrat classique voit sa date de fin calculée et fixée automatiquement au 31 décembre de l'année de début, sans action de l'utilisateur.
- [x] Les baux à la nuitée ou meublés conservent une date de fin librement définie.
- [x] La règle ne casse pas le calcul du prorata temporis déjà en place (LOT-04).

## 5. Notes de vérification (2026-09-30, avec données réelles) — 2 bugs trouvés et corrigés
En testant la création d'un contrat classique en direct, le champ "Date de fin" s'affichait **vide** au lieu de "31/12/2026", alors même que la valeur envoyée au serveur (et donc le contrat créé) était correcte. Deux causes :
1. **Champ vide** : `setValue("dateFin", calculateDateFinAuto(dateDebut))` écrit un objet `Date` directement sur l'input DOM natif (`register()`, non contrôlé) — un `<input type="date">` attend une chaîne `"yyyy-mm-dd"`, pas un objet `Date` (qui se coerce en `"Tue Dec 31 2026..."`, invalide, donc affiché vide). Corrigé en passant ce champ spécifique sous `Controller` (react-hook-form), qui permet de formater explicitement la valeur affichée sans changer le type `Date` stocké/validé (le schéma Zod exige `z.date()`, une chaîne aurait fait échouer la validation serveur).
2. **Décalage d'un jour** (31/12 → 30/12 affiché après le 1er correctif) : `toDateInputValue` utilisait `date.toISOString().slice(0,10)`, qui convertit en UTC. `calculateDateFinAuto` construit la date en heure locale (`new Date(year, 11, 31)`), donc minuit local le 31/12 devient 23h UTC le 30/12 dans un fuseau horaire en avance sur UTC (ex. WAT/UTC+1). Corrigé en formatant directement les composants locaux (`getFullYear()/getMonth()/getDate()`) sans passer par `toISOString()`.
- Testé en direct : contrat classique (MENSUEL) sur unité non meublée → "31/12/2026" affiché correctement, champ désactivé avec l'explication, et persisté correctement en base (CTR-2026-000005). Contrat nuitée (QUOTIDIEN) sur unité meublée → champ éditable, dates librement saisies (10/10/2026 → 13/10/2026) et persistées telles quelles (CTR-2026-000006), fréquence auto-présélectionnée à Quotidien.
- Le bug du décalage UTC (`toISOString().slice(0,10)` au lieu d'un formatage local) existe potentiellement ailleurs dans le code (`LocataireEditModal.tsx`, `ResilierContratButton.tsx` utilisent le même pattern) — pas corrigé partout, seulement là où ce LOT l'a rendu visible. À vérifier si ça pose problème ailleurs.
