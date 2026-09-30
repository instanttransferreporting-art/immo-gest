export type AuditLogDTO = Readonly<{
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    user: Readonly<{ nom: string; prenom: string }>;
}>;
