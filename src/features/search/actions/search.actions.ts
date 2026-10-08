"use server";

import { getCurrentSession } from "@/lib/auth";
import { SearchService } from "@/features/search/services/search.service";
import type { ActionResponse } from "@/types/action-response.types";
import type { SearchResultDTO } from "@/features/search/types/search.types";

export async function searchGlobal(query: string): Promise<ActionResponse<SearchResultDTO[]>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    try {
        const results = await SearchService.search(typeof query === "string" ? query.slice(0, 100) : "");
        return { success: true, message: "OK", data: results };
    } catch {
        return { success: false, message: "La recherche a échoué." };
    }
}
