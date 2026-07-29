# LOT-13 : Moteur d'Emails Transactionnels

## 1. Objectif
Automatiser l'envoi des quittances, des avis d'échéance et des relances directement par email depuis la plateforme.

## 2. Dépendances
- LOT-12 (Relances), LOT-06 (Encaissements)

## 3. Sous-tâches
- **13.1 - Configuration Resend** : Initialiser le client Resend dans `lib/mail.ts`. L'intégration de Resend sera rapide à mettre en place sur l'environnement de production, l'authentification du domaine via la plateforme LWS avec les entrées MX, SPF et DKIM étant déjà opérationnelle. Il ne reste qu'à brancher l'API.
- **13.2 - Templates React Email** : Créer les templates dans un dossier `emails/` : `AvisEcheanceTemplate.tsx`, `QuittanceTemplate.tsx` et `RelanceTemplate.tsx`.
- **13.3 - Service Mail** : Créer `mail.service.ts` encapsulant les appels à Resend avec rendu des templates React.
- **13.4 - Server Actions (Hooks)** : Connecter l'envoi d'email aux actions existantes. Ex : Lorsqu'un paiement valide une facture, déclencher asynchronement l'envoi de la quittance.
- **13.5 - UI Statut Mail** : Ajouter un badge sur la table des factures indiquant si l'email a été envoyé (et optionnellement son statut de délivrabilité).

## 4. Critères d'acceptation
- [ ] L'envoi d'un email ne bloque pas le fil d'exécution principal (utilisation de méthodes asynchrones non bloquantes).
- [ ] Les emails utilisent le logo et le nom de l'`Organization` expéditrice.
- [ ] Les templates sont responsive et s'affichent correctement sur mobile et desktop.