# LOT-14 : Tableaux de bord Spécifiques, Rapports et Exports

## 1. Objectif
Séparer les indicateurs de performance selon les rôles (DG vs Gestionnaire) et générer l'ensemble des rapports locatifs et financiers téléchargeables.

## 2. Dépendances
- LOT-09 (Dashboard), LOT-10 (RBAC)

## 3. Sous-tâches
- **14.1 - Vues Tableaux de Bord par Rôle** :
    - **Vue DG (Lecture seule)** : Nombre de biens, Taux d'occupation (%), Revenus mensuels/annuels, Montant des impayés, Nombre de contrats actifs.
    - **Vue Gestionnaire** : Contrats arrivant à échéance, Logements vacants, Travaux en cours, Relances à effectuer.
- **14.2 - Moteur de Rapports (/dashboard/rapports)** :
    - **Locatifs** : Liste locataires, Liste biens, Contrats actifs, Contrats expirés.
    - **Financiers** : Loyers facturés, Loyers encaissés, Impayés, Cautions, Charges.
    - **Performance** : Taux d'occupation, Rendement par immeuble, Rentabilité.
- **14.3 - Module d'Exportation** :
    - Export PDF (React-PDF/PDF-Lib) avec corrections typographiques (ex: "20 000 FCFA" via `Intl.NumberFormat`, pas de "/").
    - Export Excel (.xlsx) via ExcelJS.

## 4. Critères d'acceptation
- [ ] Le DG accède aux métriques consolidées sans bouton d'édition ou de création.
- [ ] Les montants financiers sur les PDF sont formatés correctement.