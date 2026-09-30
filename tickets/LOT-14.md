# LOT-14 : Moteur de Génération PDF et Excel

## 1. Objectif
Permettre le téléchargement des documents comptables au format PDF (Quittances, Baux) et l'export des données au format Excel pour les comptables ou les propriétaires.

## 2. Dépendances
- LOT-07 (Reversements), LOT-09 (Dashboard)

## 3. Sous-tâches
- **14.1 - Génération PDF (Factures/Quittances)** : Intégrer React-PDF ou PDF-Lib pour générer les quittances de loyer en format A4 strict (téléchargeable).
- **14.2 - Génération PDF (Contrats)** : Créer un template PDF pour le contrat de bail reprenant les clauses légales et les informations dynamiques (Locataire, Unité, Loyer).
- **14.3 - Export Excel (Reversements)** : Implémenter ExcelJS pour générer un fichier `.xlsx` détaillé de la reddition de comptes d'un propriétaire.
- **14.4 - Export Excel (Parc global)** : Ajouter un bouton sur le Dashboard pour exporter la liste complète des baux actifs et des locataires en Excel.
- **14.5 - Route API de Téléchargement** : Créer les `Route Handlers` (`app/api/export/[type]/route.ts`) retournant les bons headers HTTP (`Content-Disposition: attachment`).

## 4. Critères d'acceptation
- [ ] Les fichiers PDF sont correctement paginés.
- [ ] Les exports Excel contiennent des colonnes typées (les nombres sont de vrais nombres, pas des chaînes de caractères).
- [ ] Les fichiers générés sont nommés dynamiquement (ex: `Quittance_Loyer_Juin_2026.pdf`).