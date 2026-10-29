/** Décor du login : fond « graffiti » et illustration immobilière (SVG pur, sans asset externe). */

export function AuthBackdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-brand-50 dark:bg-background">
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-200/60 blur-3xl dark:bg-brand-900/40" />
            <div className="absolute -right-24 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-900/20" />

            <svg
                className="absolute inset-0 h-full w-full text-brand-600/25 dark:text-brand-400/20"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 1200 800"
            >
                {/* maison doodle */}
                <g transform="translate(70 90) rotate(-8)">
                    <path d="M0 60 L60 0 L120 60" />
                    <path d="M15 50 V120 H105 V50" />
                    <path d="M50 120 V80 H75 V120" />
                </g>
                {/* immeuble */}
                <g transform="translate(1020 80) rotate(6)">
                    <path d="M0 150 V10 H70 V150 Z" />
                    <path d="M15 30 H25 M45 30 H55 M15 60 H25 M45 60 H55 M15 90 H25 M45 90 H55" />
                    <path d="M70 150 V70 H110 V150" />
                </g>
                {/* clé */}
                <g transform="translate(110 560) rotate(25)">
                    <circle cx="25" cy="25" r="22" />
                    <path d="M47 25 H140 M110 25 V50 M130 25 V45" />
                </g>
                {/* étoiles / étincelles */}
                <path d="M300 60 L306 80 L326 86 L306 92 L300 112 L294 92 L274 86 L294 80 Z" />
                <path d="M930 640 L935 656 L951 661 L935 666 L930 682 L925 666 L909 661 L925 656 Z" />
                <path d="M1100 420 L1105 436 L1121 441 L1105 446 L1100 462 L1095 446 L1079 441 L1095 436 Z" />
                {/* spirales / gribouillis */}
                <path d="M440 700 q30 -50 60 0 t60 0 t60 0 t60 0" />
                <path d="M780 50 q20 -30 40 0 t40 0 t40 0" />
                <path d="M40 360 c30 -40 70 -40 70 0 s-40 50 -40 10 s50 -30 50 10" />
                {/* flèche tracée à la main */}
                <path d="M980 330 c40 -30 90 -20 110 20 M1090 350 l5 -22 M1090 350 l-22 -8" />
                {/* croix et points */}
                <path d="M600 40 l16 16 M616 40 l-16 16" />
                <path d="M200 440 l14 14 M214 440 l-14 14" />
                <path d="M1130 720 l14 14 M1144 720 l-14 14" />
                <circle cx="380" cy="300" r="7" />
                <circle cx="860" cy="200" r="7" />
                <circle cx="720" cy="740" r="7" />
                <circle cx="150" cy="740" r="7" />
                {/* toits d'angle */}
                <g transform="translate(840 590) rotate(-4)">
                    <path d="M0 50 L50 5 L100 50" />
                    <path d="M12 42 V100 H88 V42" />
                </g>
            </svg>
        </div>
    );
}

export function AuthIllustration() {
    return (
        <svg
            aria-hidden
            viewBox="0 0 400 360"
            className="h-auto w-full max-w-sm"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* soleil */}
            <circle cx="320" cy="70" r="34" fill="#fcd34d" opacity="0.95" />
            <circle cx="320" cy="70" r="50" fill="#fcd34d" opacity="0.2" />
            {/* nuages */}
            <g fill="white" opacity="0.85">
                <ellipse cx="80" cy="60" rx="38" ry="12" />
                <ellipse cx="105" cy="52" rx="26" ry="12" />
                <ellipse cx="250" cy="110" rx="30" ry="9" />
                <ellipse cx="270" cy="104" rx="20" ry="9" />
            </g>

            {/* sol */}
            <ellipse cx="200" cy="322" rx="185" ry="16" fill="black" opacity="0.18" />

            {/* immeuble de gauche */}
            <rect x="40" y="150" width="90" height="170" rx="4" fill="#e0e7ff" />
            <g fill="#6366f1" opacity="0.55">
                {[170, 205, 240, 275].map((y) =>
                    [55, 80, 105].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="20" rx="2" />),
                )}
            </g>

            {/* immeuble de droite */}
            <rect x="270" y="110" width="90" height="210" rx="4" fill="#c7d2fe" />
            <g fill="#4338ca" opacity="0.5">
                {[128, 162, 196, 230, 264].map((y) =>
                    [284, 309, 334].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="20" rx="2" />),
                )}
            </g>

            {/* maison centrale */}
            <path d="M120 200 L200 128 L280 200 Z" fill="#f97316" />
            <rect x="136" y="200" width="128" height="120" fill="#ffffff" />
            <rect x="188" y="248" width="30" height="72" rx="3" fill="#4338ca" />
            <circle cx="210" cy="286" r="2.5" fill="#fcd34d" />
            <rect x="150" y="224" width="28" height="28" rx="3" fill="#bfdbfe" />
            <rect x="230" y="224" width="28" height="28" rx="3" fill="#bfdbfe" />
            <path d="M164 224 V252 M150 238 H178 M244 224 V252 M230 238 H258" stroke="white" strokeWidth="2" />
            <rect x="238" y="146" width="16" height="30" fill="#c2410c" />

            {/* arbres */}
            <rect x="14" y="290" width="6" height="30" fill="#92400e" />
            <circle cx="17" cy="282" r="20" fill="#34d399" />
            <rect x="378" y="296" width="6" height="24" fill="#92400e" />
            <circle cx="381" cy="288" r="16" fill="#10b981" />

            {/* panneau « à louer » */}
            <rect x="96" y="288" width="4" height="34" fill="#78350f" />
            <rect x="80" y="270" width="36" height="22" rx="3" fill="#fcd34d" />
            <path d="M86 278 H110 M86 284 H102" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
