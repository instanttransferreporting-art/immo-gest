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
- [ ] Un contrat actif peut être renouvelé en un clic, générant un nouveau contrat lié au précédent sur la période fiscale suivante.
- [ ] Un contrat peut être suspendu puis réactivé sans perdre son historique ni libérer l'unité associée.
- [ ] Un contrat résilié ne peut être ni renouvelé, ni suspendu.
