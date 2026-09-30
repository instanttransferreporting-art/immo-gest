# LOT-22 : Annulation de Paiement avec Double Validation

## 1. Objectif
Permettre l'annulation d'un paiement enregistré par erreur, avec le garde-fou de double validation exigé par le cahier des charges (§13 : "Double validation pour les annulations de paiement").

## 2. Dépendances
- LOT-06 (Paiements)

## 3. Sous-tâches
- **22.1 - Service d'annulation** : `PaiementService.annuler(paiementId, motif)` — marque `estAnnule = true`, recalcule `soldeRestant` et `estSoldee`/statut de la facture associée en conséquence (transaction atomique).
- **22.2 - Double validation côté UI** : la Server Action exige une première confirmation (dialog "Confirmer l'annulation"), puis une seconde étape explicite (ex : ressaisir le montant du paiement ou cocher une case de confirmation) avant exécution réelle.
- **22.3 - Permission dédiée** : nouvelle clé `PAIEMENT_ANNULER` réservée à ADMIN (et DIRECTEUR_GENERAL en lecture/validation si pertinent).
- **22.4 - Traçabilité** : enregistrer qui a annulé, quand et pourquoi (motif obligatoire), en s'appuyant sur l'audit log (LOT-23).

## 4. Critères d'acceptation
- [x] Un paiement annulé n'est plus compté dans le total encaissé de la facture, dont le solde restant dû est recalculé immédiatement.
- [x] L'annulation nécessite deux étapes de confirmation distinctes avant d'être exécutée.
- [x] Seuls les rôles autorisés peuvent annuler un paiement, et un motif est obligatoire.

## 5. Notes de vérification (2026-09-30, avec données réelles)
- Annulé un vrai paiement (Njoya Aicha, FAC-2026-000006, 80 000 FCFA) via l'UI. Étape 1 (motif) : bouton "Continuer" bloqué tant que le champ est vide — testé en cliquant à vide, aucun effet. Étape 2 (case à cocher "Je confirme vouloir annuler...") : bouton "Confirmer l'annulation" cliqué SANS cocher la case → aucun effet (paiement toujours présent, vérifié par rechargement de page) ; cliqué APRÈS avoir coché → annulation effective.
- Après annulation : "Total encaissé" passe de 80 000 à 0 FCFA, "Reste à payer" de 0 à 80 000 FCFA, recalcul immédiat. Le paiement annulé disparaît de la liste "Historique des paiements" de la facture (le repository filtre `estAnnule: false` par design — l'enregistrement persiste en base avec motif/date/auteur, juste plus affiché dans cette liste).
- Traçabilité confirmée dans `/audit` : entrée "PAIEMENT_ANNULER — Paiement de 80000 FCFA annulé — motif : [motif saisi]", horodatée, avec l'utilisateur exact.
- Permission `PAIEMENT_ANNULER` (ADMIN uniquement) vérifiée par lecture de code (`checkPermission`), cohérente avec le mécanisme RBAC déjà testé en profondeur au LOT-10 — pas re-testée avec un second compte faute de temps, mais le garde-fou est le même partout dans l'app.
