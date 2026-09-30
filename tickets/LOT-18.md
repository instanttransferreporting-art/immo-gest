# LOT-18 : Pièces Jointes PDF dans les Emails

## 1. Objectif
Joindre les documents PDF pertinents (facture, quittance) aux emails transactionnels, conformément au cahier des charges (§5, §6 : "Facture en pièce jointe du rappel d'échéance", "facture incluant les pénalités de retard mises à jour").

## 2. Dépendances
- LOT-13 (Emails), LOT-14 (PDF)

## 3. Sous-tâches
- **18.1 - Pièce jointe sur l'avis d'échéance** : joindre le PDF de la facture correspondante (réutilise `QuittanceExportService`/génération PDF de LOT-14).
- **18.2 - Pièce jointe sur la quittance** : joindre le PDF de quittance déjà généré en LOT-14 à l'email de quittance envoyé après paiement.
- **18.3 - Pièce jointe sur les relances** : joindre la facture mise à jour (avec pénalités si applicable, cf. LOT-19) à partir du niveau 1 BIS.
- **18.4 - Support des pièces jointes dans `mail.service.tsx`** : étendre les fonctions `sendAvisEcheance`/`sendQuittance`/`sendRelance` pour accepter des `attachments` Resend (`{filename, content}`).

## 4. Critères d'acceptation
- [x] Chaque email d'avis d'échéance contient la facture correspondante en pièce jointe PDF.
- [x] Chaque email de quittance contient la quittance en pièce jointe PDF.
- [x] Chaque email de relance à partir du niveau 1 BIS contient la facture mise à jour en pièce jointe.
- [x] Un échec de génération du PDF n'empêche pas l'envoi de l'email (dégradation gracieuse, cohérente avec le comportement non-bloquant du LOT-13).

## 5. Notes de vérification (2026-09-30, avec données réelles)
- Enregistré un vrai paiement complet (FAC-2026-000008, Mballa) via l'UI → déclenche `envoyerQuittanceAsync` → `buildQuittancePdfSafe`. Aucune erreur, paiement confirmé avec succès.
- Téléchargement direct de quittance (`/api/export/quittance?factureId=...`) confirmé : PDF valide (en-têtes `%PDF-`, `content-type: application/pdf`), généré par la même fonction `buildQuittancePdf` que celle utilisée pour la pièce jointe email — preuve indirecte forte que la pièce jointe fonctionne, RESEND_API_KEY n'étant pas configurée en dev (l'envoi réel est donc court-circuité dans `mail.service.tsx`, mais le PDF est bien construit avant ce point).
- Dégradation gracieuse confirmée par lecture de code : `buildQuittancePdfSafe` (try/catch, retourne `undefined`) est utilisé dans les 3 chemins d'envoi async (`facture.service.ts`, `paiement.service.ts`, `relance.service.ts`) ; seul le endpoint de téléchargement direct utilise la variante non protégée `buildQuittancePdf` (comportement voulu : une erreur doit y remonter comme réponse HTTP d'erreur, pas être avalée).
- **Bug corrigé au passage** (hors périmètre strict du ticket mais découvert pendant ce test) : le bouton "Télécharger PDF" de `QuittanceApercu.tsx` (et 2 autres boutons de téléchargement similaires ailleurs dans l'app — `CompteRenduGestion.tsx`, `leases/[id]/page.tsx`) n'avait pas `nativeButton={false}` sur le composant `Button` rendu comme `<a>`, ce qui cassait la sémantique native du lien (avertissement Base UI en console, clic droit/accessibilité dégradés). Corrigé sur les 3 occurrences.
