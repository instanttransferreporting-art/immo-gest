import { TypeDocumentContrat } from "@/generated/prisma/enums";

export const TYPE_DOCUMENT_CONTRAT_LABELS: Readonly<Record<TypeDocumentContrat, string>> = {
    CONTRAT_SIGNE: "Contrat de bail signé",
    CONTRAT_SIGNE_SUIVANT: "Contrat de bail signé — année suivante",
    ETAT_LIEUX_ENTREE: "État des lieux d'entrée",
    ETAT_LIEUX_SORTIE: "État des lieux de sortie",
};

export const TYPE_DOCUMENT_CONTRAT_HINTS: Readonly<Record<TypeDocumentContrat, string>> = {
    CONTRAT_SIGNE: "Scan du bail signé par les deux parties.",
    CONTRAT_SIGNE_SUIVANT: "Second bail (1er janvier – 31 décembre de l'année suivante), signé par les deux parties.",
    ETAT_LIEUX_ENTREE: "À téléverser à l'entrée du locataire, après signature.",
    ETAT_LIEUX_SORTIE: "À téléverser à la sortie du locataire.",
};

export const DOCUMENT_CONTRAT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"] as const;
