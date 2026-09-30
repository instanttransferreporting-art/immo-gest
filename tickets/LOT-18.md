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
- [ ] Chaque email d'avis d'échéance contient la facture correspondante en pièce jointe PDF.
- [ ] Chaque email de quittance contient la quittance en pièce jointe PDF.
- [ ] Chaque email de relance à partir du niveau 1 BIS contient la facture mise à jour en pièce jointe.
- [ ] Un échec de génération du PDF n'empêche pas l'envoi de l'email (dégradation gracieuse, cohérente avec le comportement non-bloquant du LOT-13).
