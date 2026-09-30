# LOT-21 : Renouvellement et Suspension de Contrat

## 1. Objectif
Compléter le cycle de vie du bail au-delà de la création et de la résiliation (LOT-11), conformément au cahier des charges (§5 : "Création, renouvellement, résiliation et suspension des contrats").

## 2. Dépendances
- LOT-04 (Contrats), LOT-11 (Résiliation), LOT-20 (Règles de dates)

## 3. Sous-tâches
- **21.1 - Service de renouvellement** : `ContratService.renouvelerContrat(contratId)` — crée un nouveau contrat du 1er janvier au 31 décembre suivant, en reprenant les conditions du contrat précédent (loyer, charges, dépôt de garantie) avec possibilité d'ajustement avant validation.
- **21.2 - Service de suspension** : `ContratService.suspendreContrat(contratId, motif)` — passe le statut à `SUSPENDU` sans libérer l'unité (contrairement à la résiliation), avec réactivation possible vers `ACTIF`.
- **21.3 - UI** : boutons "Renouveler" et "Suspendre / Réactiver" sur la page de détail du contrat (`/leases/[id]`), visibles selon le statut courant.
- **21.4 - Permissions** : réutiliser `CONTRAT_RESILIER` (ADMIN/GESTIONNAIRE) pour ces nouvelles actions, cohérent avec la matrice existante.

## 4. Critères d'acceptation
- [x] Un contrat actif peut être renouvelé en un clic, générant un nouveau contrat lié au précédent sur la période fiscale suivante.
- [x] Un contrat peut être suspendu puis réactivé sans perdre son historique ni libérer l'unité associée.
- [x] Un contrat résilié ne peut être ni renouvelé, ni suspendu.

## 5. Notes de vérification (2026-09-30, avec données réelles)
- Suspension du contrat de Njoya Aicha (CTR-2026-000003) : statut → Suspendu, seul le bouton "Réactiver" reste visible ; l'unité A21 reste comptée comme occupée (le dialogue de création de contrat affichait toujours "Aucune unité libre disponible").
- Réactivation : statut → Actif, boutons Suspendre/Renouveler/Résilier de retour, historique (caution, période) intact.
- Renouvellement du contrat de Mballa Jean (CTR-2026-000001, 15/01/2026 → 31/12/2026) : nouveau contrat CTR-2026-000007 créé (01/01/2027 → 31/12/2027), mêmes conditions (loyer, charges, dépôt de garantie), nouvelle caution créée (300 000 FCFA, En cours) ; l'ancien contrat est passé au statut Expiré.
- Contrat expiré (CTR-2026-000004) : aucun bouton Suspendre/Renouveler/Résilier affiché, seul le téléchargement du bail reste disponible.
