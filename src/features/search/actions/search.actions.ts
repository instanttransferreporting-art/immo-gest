"use server";

import { getCurrentSession } from "@/lib/auth";
import { SearchService } from "@/features/search/services/search.service";
import type { ActionResponse } from "@/types/action-response.types";
import type { SearchResultDTO } from "@/features/search/types/search.types";
import { getI18n } from "@/i18n/server";

export async function searchGlobal(query: string): Promise<ActionResponse<SearchResultDTO[]>> {
    const { t } = await getI18n();

    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: t.common.errors.unauthenticated };
    }

    try {
        const results = await SearchService.search(typeof query === "string" ? query.slice(0, 100) : "");
        return { success: true, message: "OK", data: results };
    } catch {
        return { success: false, message: t.admin.search.failed };
    }
}
