# LOT-19 : Calcul Automatique des Pénalités de Retard

## 1. Objectif
Appliquer automatiquement des pénalités de retard sur les factures impayées, conformément au cahier des charges (§6, §7 : "Calcul des pénalités", "facture incluant les pénalités de retard mises à jour").

## 2. Dépendances
- LOT-06 (Facturation), LOT-12 (Impayés/Relances)

## 3. Sous-tâches
- **19.1 - Paramétrage du taux de pénalité** : ajouter un taux (%) ou montant fixe de pénalité, configurable au niveau de l'`Organization` (page `/settings`).
- **19.2 - Calcul automatique** : lors du passage en relance Niveau 1 BIS (J+15), calculer et appliquer la pénalité sur `Facture.penalites`, et recalculer `totalDu` en conséquence.
- **19.3 - Affichage** : refléter la pénalité appliquée dans le détail de la facture, la quittance et les emails de relance (LOT-18).

## 4. Critères d'acceptation
- [ ] Une facture toujours impayée après J+15 voit son `totalDu` augmenté automatiquement du montant de la pénalité configurée par l'agence.
- [ ] Le montant de la pénalité est visible sur la facture, dans le détail `/invoices/[id]` et dans l'email de relance.
- [ ] La pénalité n'est appliquée qu'une seule fois par facture (pas de double application si plusieurs relances de même niveau).
