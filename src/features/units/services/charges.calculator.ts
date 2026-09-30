import { TypeCharges } from "@/generated/prisma/enums";
import type { UniteDTO } from "@/features/units/types/unit.types";

export function computeChargesAmount(unite: Pick<UniteDTO, "typeCharges" | "valeurCharges" | "loyerMensuel">): number {
    if (unite.typeCharges === TypeCharges.POURCENTAGE) {
        return (unite.loyerMensuel * unite.valeurCharges) / 100;
    }

    return unite.valeurCharges;
}
