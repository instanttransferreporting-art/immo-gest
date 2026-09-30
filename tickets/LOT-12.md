# LOT-12 : Suivi des Impayés et Relances

## 1. Objectif
Identifier les locataires en retard de paiement et générer des relances graduées pour le recouvrement.

## 2. Dépendances
- LOT-05 (Facturation), LOT-10 (Multi-Tenant)

## 3. Sous-tâches
- **12.1 - Modèle Relance** : S'assurer que le modèle `Relance` est lié à une `Facture` avec un `NiveauRelance` (NIVEAU_1_AMIABLE, NIVEAU_2_MISE_EN_DEMEURE, NIVEAU_3_CONTENTIEUX).
- **12.2 - Détection Impayés (Service)** : Créer une fonction dans le service Facture qui liste toutes les factures "EN_ATTENTE" ou "PARTIEL" dont la date d'échéance est dépassée.
- **12.3 - Génération Relance (Service)** : Créer `relance.service.ts` pour enregistrer une tentative de relance et incrémenter le niveau.
- **12.4 - UI Recouvrement** : Créer la page `/dashboard/recouvrement` avec un tableau dédié aux impayés (trié par nombre de jours de retard).
- **12.5 - Actions de Relance** : Intégrer des boutons d'action rapide dans le tableau pour déclencher une relance manuelle.

## 4. Critères d'acceptation
- [ ] Le système empêche de générer une Mise en Demeure (Niveau 2) si une Relance Amiable (Niveau 1) n'a pas été préalablement enregistrée.
- [ ] La liste des impayés se met à jour automatiquement dès qu'un encaissement (LOT-06) est saisi.