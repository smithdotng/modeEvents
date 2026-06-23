/**
 * Mode Events logo — recreated as SVG.
 *
 * <ModeEventsLogo size={36} />          compact mark (navbar)
 * <ModeEventsLogo size={160} full />    full mark + EVENTS text
 * <ModeEventsLogo size={160} full invert />  cream squares on dark bg
 */
export default function ModeEventsLogo({ size = 36, full = false, invert = false }) {
  const sq   = invert ? '#dddcd7' : '#2a3b19';   // square fill
  const lt   = invert ? '#2a3b19' : '#dddcd7';   // letter stroke/fill
  const text = invert ? '#dddcd7' : '#2a3b19';   // EVENTS text

  // viewBox: 220 wide × (220 mark + 36 text gap) = 220×256 with text, 220×220 without
  const vbH  = full ? 258 : 220;
  const h    = full ? size * (258 / 220) : size;

  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 220 ${vbH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Top-left: M ─────────────────────────────────────────────── */}
      <rect width="100" height="100" rx="14" fill={sq} />
      {/* M: two outer pillars connected by a deep-V at centre */}
      <path
        d="M15 84 L15 18 L50 62 L85 18 L85 84"
        stroke={lt} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* ── Top-right: O ─────────────────────────────────────────────── */}
      <rect x="120" width="100" height="100" rx="14" fill={sq} />
      {/* O: clean oval stroke */}
      <ellipse cx="170" cy="50" rx="30" ry="33" stroke={lt} strokeWidth="11" />
      {/* Distinctive diagonal accent slash */}
      <line x1="192" y1="18" x2="148" y2="82" stroke={sq} strokeWidth="14" strokeLinecap="round" />
      <line x1="192" y1="18" x2="148" y2="82" stroke={lt} strokeWidth="6"  strokeLinecap="round" />

      {/* ── Bottom-left: D ───────────────────────────────────────────── */}
      <rect y="120" width="100" height="100" rx="14" fill={sq} />
      {/* D outer shape */}
      <path d="M18 130 L18 210 Q86 210 86 170 Q86 130 18 130 Z" fill={lt} />
      {/* D inner cut-out */}
      <path d="M33 146 L33 194 Q68 194 68 170 Q68 146 33 146 Z" fill={sq} />
      {/* Diagonal needle */}
      <line x1="80" y1="126" x2="20" y2="214" stroke={lt} strokeWidth="7" strokeLinecap="round" />

      {/* ── Bottom-right: E ──────────────────────────────────────────── */}
      <rect x="120" y="120" width="100" height="100" rx="14" fill={sq} />
      {/* E: vertical bar + three horizontals (middle one shorter) */}
      <path
        d="M138 138 L202 138 M138 168 L188 168 M138 198 L202 198"
        stroke={lt} strokeWidth="12" strokeLinecap="round"
      />
      <line x1="138" y1="138" x2="138" y2="198" stroke={lt} strokeWidth="12" strokeLinecap="round" />

      {/* ── EVENTS text (only when full=true) ────────────────────────── */}
      {full && (
        <text
          x="110" y="250"
          textAnchor="middle"
          fill={text}
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
          fontSize="17"
          letterSpacing="9"
          fontWeight="300"
        >
          EVENTS
        </text>
      )}
    </svg>
  );
}
