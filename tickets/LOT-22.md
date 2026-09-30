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
- [ ] Un paiement annulé n'est plus compté dans le total encaissé de la facture, dont le solde restant dû est recalculé immédiatement.
- [ ] L'annulation nécessite deux étapes de confirmation distinctes avant d'être exécutée.
- [ ] Seuls les rôles autorisés peuvent annuler un paiement, et un motif est obligatoire.
