import { getDate, getDaysInMonth } from "date-fns";

export function calculateProrata(dateDebut: Date, loyerMensuel: number): number {
    const dayOfMonth = getDate(dateDebut);

    if (dayOfMonth === 1) {
        return loyerMensuel;
    }

    const totalDaysInMonth = getDaysInMonth(dateDebut);
    const remainingDays = totalDaysInMonth - dayOfMonth + 1;

    return Math.round((loyerMensuel * remainingDays) / totalDaysInMonth);
}
