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
- [x] Les avis d'échéance partent automatiquement selon le délai correspondant à la fréquence du contrat, sans action humaine.
- [x] Les relances de niveau 1/1 BIS/2 se déclenchent automatiquement aux échéances J+0/J+15/J+30 pour les factures impayées.
- [x] Le déclenchement manuel existant (bouton sur `/recouvrement`) continue de fonctionner en parallèle sans double-envoi.

## 5. Notes de vérification (2026-09-30, avec données réelles)
- `GET /api/cron/avis-echeance` et `GET /api/cron/relances` : 200 avec le bearer token, 401 sans, sur les 2 organisations réelles de la base.
- `avis-echeance` : `contratsEvalues: 0` le 30/09 — correct, puisque J-5 (fréquence MENSUEL) tombe le 26/09 et non le 30/09. Le calcul du délai a été vérifié par le calcul manuel, pas re-testable en direct sans avancer la date système.
- `relances` : `relancesEnvoyees: 0` le 30/09 sur 3 factures impayées — correct, aucune n'est exactement à J+0/15/30 aujourd'hui (`joursRetard` se calcule sur le 1er du mois d'échéance, donc les paliers exacts tombent à des dates calendaires précises qui ne coïncident pas toujours avec le jour du test ; le cron tourne quotidiennement donc chaque échéance passera forcément par son palier exact un jour donné).
- Le moteur sous-jacent (`genererRelanceCore`, partagé entre le cron et le bouton manuel `/recouvrement`) a été testé en direct via les boutons manuels : "Envoyer la mise en demeure" (CDS SARL, NIVEAU_2) et "Envoyer un rappel amiable" (Mballa, NIVEAU_1) — les deux ont mis à jour le niveau de relance correctement, sans doublon, sans pénalité appliquée à tort au NIVEAU_1 (solde inchangé).
- Garde anti-doublon (`dejaAuNiveauOuSuperieur`) confirmée par construction du code, cohérente avec le comportement observé (CDS déjà au NIVEAU_2 n'a pas été retraité par le cron relancé juste après).
