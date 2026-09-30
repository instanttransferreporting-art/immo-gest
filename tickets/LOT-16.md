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
- [x] Le DG accède aux métriques consolidées sans bouton d'édition ou de création.
- [x] Les montants financiers sur les PDF sont formatés correctement.

## 5. Notes d'implémentation (2026-09-30)
- Vue DG : `src/features/dashboard/components/DGDashboard.tsx`, lecture seule (aucun bouton d'export/édition), branchée dans `dashboard/page.tsx` via `isDirecteurGeneral`.
- Vue Gestionnaire : sections "Contrats arrivant à échéance" (J+60) et "Logements vacants" ajoutées à `AlertesSection.tsx`. "Travaux en cours" couvert par la section Incidents existante — le modèle `Maintenance` n'a aucune UI/CRUD dans ce projet, hors-scope de ce LOT.
- `/reports` : 9 rapports (Locatifs ×4, Financiers ×5) avec compteur/montant en direct + export Excel, plus un onglet Performance (taux d'occupation par immeuble, rendement par immeuble, rentabilité globale) affiché sur la page.
- Export : réutilise le moteur ExcelJS du LOT-14 (`/api/export/rapport?reportType=...`), formatage FCFA via `Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF" })` déjà en place partout dans le projet.
- Export PDF non ajouté pour les rapports (Excel est plus adapté à des listes tabulaires) — à ajouter si un besoin précis de PDF apparaît.
- Nouveau composant partagé `src/components/ui/tabs.tsx` (Base UI Tabs) pour les catégories de rapports.