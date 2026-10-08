export type SearchResultGroup = "IMMEUBLE" | "UNITE" | "LOCATAIRE" | "CONTRAT" | "PROPRIETAIRE";

export type SearchResultDTO = Readonly<{
    id: string;
    group: SearchResultGroup;
    title: string;
    subtitle: string;
    href: string;
}>;
