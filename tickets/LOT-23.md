# LOT-23 : Historique Complet des Actions (Audit Log)

## 1. Objectif
Activer et exploiter le modèle `AuditLog` (déjà présent dans le schéma mais jamais utilisé) pour tracer les actions sensibles, conformément au cahier des charges (§13 : "Historique complet des actions").

## 2. Dépendances
- LOT-10 (RBAC) — transverse à l'ensemble des features existantes

## 3. Sous-tâches
- **23.1 - Service d'écriture centralisé** : `AuditService.log({action, details, userId, organizationId})` dans `src/lib/`, écriture non bloquante (fire-and-forget, cohérent avec le pattern déjà utilisé pour les emails en LOT-13).
- **23.2 - Instrumentation des actions sensibles** : brancher l'audit sur création/modification/suppression d'Immeuble, Unité, Locataire ; création/résiliation/renouvellement/suspension de Contrat ; création/annulation de Paiement (LOT-22) ; validation de Reversement ; restitution de Caution.
- **23.3 - UI de consultation** : page `/audit` (ADMIN uniquement, nouvelle permission `AUDIT_VIEW`), listant l'historique avec filtres par utilisateur, type d'action et période.

## 4. Critères d'acceptation
- [ ] Chaque action sensible listée en 23.2 génère une entrée d'audit consultable, avec organizationId, utilisateur, horodatage.
- [ ] L'écriture de l'audit n'introduit pas de latence perceptible ni de blocage sur l'action déclenchante.
- [ ] L'historique est consultable et filtrable par un ADMIN sur `/audit`, scopé à son organisation.
