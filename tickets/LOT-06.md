# LOT-06 : Encaissements et Reçus (Quittances)

## 1. Objectif
Enregistrer les paiements des locataires (totaux ou partiels), mettre à jour le statut des factures et générer la quittance de loyer.

## 2. Dépendances
- LOT-05 (Facturation)

## 3. Sous-tâches
- **06.1 - Paiement (Backend)** : Créer `paiement.types.ts`, `paiement.schema.ts`, `paiement.repository.ts` et `paiement.service.ts`. Gérer les modes de paiement (Espèces, Virement, Mobile Money).
- **06.2 - Logique de Solde (Transaction)** : Dans le service, la création d'un paiement DOIT mettre à jour le statut de la `Facture` liée (`$transaction`). Si `montant_payé == total_facture`, statut -> PAYEE. Si `< total_facture`, statut -> PARTIEL.
- **06.3 - Server Actions** : Créer `paiement.actions.ts` pour traiter la soumission du paiement.
- **06.4 - UI Saisie de Paiement** : Créer `PaiementModal.tsx` ou `PaiementForm.tsx`. Accessible depuis la liste des factures, permettant de saisir un montant reçu pour une facture spécifique.
- **06.5 - Reçu (Génération basique)** : Créer un composant `QuittanceApercu.tsx` (UI) qui affiche les détails de la facture payée pour impression (HTML/CSS simple adapté pour l'impression via le navigateur).

## 4. Critères d'acceptation
- [ ] Le montant d'un paiement ne peut pas dépasser le reste à payer de la facture.
- [ ] Le statut de la facture bascule automatiquement en "PAYEE" dès que la totalité est encaissée.
- [ ] L'historique des paiements (si un locataire paie en plusieurs fois) s'affiche correctement sur les détails de la facture.