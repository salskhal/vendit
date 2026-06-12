interface MarkProps {
  size?: number;
}

export function Mark({ size = 26 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* outer ring */}
      <circle cx="16" cy="16" r="14.5" stroke="#1c1c1c" strokeWidth="1" />
      {/* inner ring */}
      <circle cx="16" cy="16" r="10" stroke="#1c1c1c" strokeWidth="1" opacity="0.4" />
      {/* coin slot */}
      <rect x="13" y="9" width="6" height="2.4" rx="1.2" fill="#1c1c1c" />
      {/* center stem */}
      <path d="M16 13.5v9" stroke="#1c1c1c" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function Logo({ size = 26 }: MarkProps) {
  return (
    <span className="nav-brand">
      <Mark size={size} />
      <span className="nav-brand__word">VendIt</span>
    </span>
  );
}
