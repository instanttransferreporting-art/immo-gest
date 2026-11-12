"use client";

import { cn } from "@/lib/utils";

/** Indicatifs proposés ; le Cameroun est l'indicatif par défaut. */
export const PHONE_COUNTRIES = [
    { code: "+237", label: "Cameroun" },
    { code: "+241", label: "Gabon" },
    { code: "+242", label: "Congo" },
    { code: "+243", label: "RD Congo" },
    { code: "+235", label: "Tchad" },
    { code: "+236", label: "Centrafrique" },
    { code: "+240", label: "Guinée équat." },
    { code: "+234", label: "Nigeria" },
    { code: "+225", label: "Côte d'Ivoire" },
    { code: "+221", label: "Sénégal" },
    { code: "+212", label: "Maroc" },
    { code: "+33", label: "France" },
    { code: "+32", label: "Belgique" },
    { code: "+41", label: "Suisse" },
    { code: "+44", label: "Royaume-Uni" },
    { code: "+49", label: "Allemagne" },
    { code: "+1", label: "USA / Canada" },
] as const;

export const DEFAULT_PHONE_CODE = "+237";

// Les indicatifs les plus longs d'abord, pour que « +237… » ne soit pas lu comme « +2… ».
const CODES_BY_LENGTH = [...PHONE_COUNTRIES].sort((a, b) => b.code.length - a.code.length);

function splitPhone(value: string | undefined): { code: string; local: string } {
    const phone = value ?? "";
    const country = CODES_BY_LENGTH.find((candidate) => phone.startsWith(candidate.code));

    if (country) {
        return { code: country.code, local: phone.slice(country.code.length) };
    }

    return { code: DEFAULT_PHONE_CODE, local: phone.replace(/\D/g, "") };
}

type PhoneInputProps = {
    id?: string;
    /** Numéro complet au format international (ex : +237690000000), ou vide. */
    value: string | undefined;
    onChange: (value: string) => void;
    onBlur?: () => void;
    invalid?: boolean;
    placeholder?: string;
};

export function PhoneInput({ id, value, onChange, onBlur, invalid, placeholder = "690000000" }: PhoneInputProps) {
    const { code, local } = splitPhone(value);

    const emit = (nextCode: string, nextLocal: string) => {
        const digits = nextLocal.replace(/\D/g, "");
        onChange(digits ? `${nextCode}${digits}` : "");
    };

    return (
        <div className="flex gap-2">
            <select
                aria-label="Indicatif"
                value={code}
                onChange={(event) => emit(event.target.value, local)}
                onBlur={onBlur}
                className="h-10 w-28 shrink-0 rounded-xl border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                {PHONE_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                        {country.code} {country.label}
                    </option>
                ))}
            </select>
            <input
                id={id}
                type="tel"
                inputMode="numeric"
                value={local}
                placeholder={placeholder}
                onChange={(event) => emit(code, event.target.value)}
                onBlur={onBlur}
                className={cn(
                    "h-10 w-full min-w-0 rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    invalid && "border-red-500"
                )}
            />
        </div>
    );
}
