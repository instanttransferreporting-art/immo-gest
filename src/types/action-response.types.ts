export type ActionResponse<T> = Readonly<{
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
}>;
