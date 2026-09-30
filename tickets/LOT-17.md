# LOT-17 : Automatisation Temporelle (Avis d'Échéance & Relances Programmés)

## 1. Objectif
Remplacer les déclenchements manuels des avis d'échéance et des relances par des envois automatiques et programmés, conformément au cahier des charges (§5, §7).

## 2. Dépendances
- LOT-05 (Facturation), LOT-12 (Relances), LOT-13 (Emails)

## 3. Sous-tâches
- **17.1 - Infrastructure de tâches planifiées** : Mettre en place un mécanisme d'exécution périodique (route API sécurisée `app/api/cron/[task]/route.ts`, protégée par un secret partagé, déclenchée par un scheduler externe — Vercel Cron ou équivalent).
- **17.2 - Job Avis d'Échéance** : Pour chaque contrat actif, calculer la prochaine échéance et déclencher l'avis selon la fréquence : J-5 (mensuel), J-15 (bimensuel/trimestriel), J-30 (semestriel/annuel), avec copie à l'adresse de l'organisation.
- **17.3 - Job Relances Automatiques** : Détecter les échéances impayées et déclencher automatiquement Niveau 1 à J+0, Niveau 1 BIS à J+15, Niveau 2 à J+30, sans bloquer le déclenchement manuel existant (LOT-12).
- **17.4 - Traçabilité des exécutions** : Journaliser chaque exécution de job (nombre traité, succès, échecs) pour diagnostic.

## 4. Critères d'acceptation
- [ ] Les avis d'échéance partent automatiquement selon le délai correspondant à la fréquence du contrat, sans action humaine.
- [ ] Les relances de niveau 1/1 BIS/2 se déclenchent automatiquement aux échéances J+0/J+15/J+30 pour les factures impayées.
- [ ] Le déclenchement manuel existant (bouton sur `/recouvrement`) continue de fonctionner en parallèle sans double-envoi.
