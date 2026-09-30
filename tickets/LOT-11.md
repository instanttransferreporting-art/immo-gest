# LOT-11 : Résiliation de Contrat et Gestion des Cautions

## 1. Objectif
Gérer le cycle de fin d'un contrat de bail, libérer l'unité locative, et traiter le workflow de la caution (restitution intégrale ou retenue pour travaux).

## 2. Dépendances
- LOT-10 (Multi-Tenant)

## 3. Sous-tâches
- **11.1 - Logique de Résiliation (Service)** : Ajouter une méthode `resilierContrat(contratId, dateFin)` dans le service Contrat. Cette action doit, via une transaction Prisma, passer le statut du contrat à "RESILIE" et remettre le statut de l'`Unite` à "LIBRE".
- **11.2 - Workflow Caution (Backend)** : Créer `caution.service.ts` pour gérer le statut de la caution associée au contrat (A_RESTITUER, RESTITUEE, RETENUE_PARTIELLE).
- **11.3 - Server Actions** : Créer les actions de résiliation et de traitement de la caution.
- **11.4 - UI Résiliation** : Ajouter un bouton "Résilier" sur la page de détail d'un contrat actif, ouvrant un modal (Zod) pour saisir la date de sortie effective et le motif.
- **11.5 - UI Caution** : Créer un onglet ou un modal de "Solde de tout compte" permettant d'imputer des frais de remise en état sur la caution avant restitution.

## 4. Critères d'acceptation
- [ ] La résiliation d'un contrat rend l'unité immédiatement disponible pour un nouveau bail.
- [ ] La retenue sur caution ne peut pas excéder le montant initial de la caution déposée.
- [ ] Un historique des états des lieux/retenues est généré lors de la clôture.