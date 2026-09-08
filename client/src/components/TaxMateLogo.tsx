/**
 * TaxMate logo mark — a geometric coin/ledger hybrid.
 *
 * Shape: a circle with a subtle vertical split down the centre
 * and two horizontal rules, evoking an open book or a balanced ledger.
 * The left half is filled forest-green; the right half is the outline only.
 * Clean, wordmark-pairable, readable at 24 px.
 */

type Props = {
  size?: number
  /** If true, renders the full horizontal lockup (mark + wordmark) */
  lockup?: boolean
  className?: string
}

export function TaxMateMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle outline */}
      <circle cx="16" cy="16" r="14.5" stroke="#2C5F4E" strokeWidth="1.5" />

      {/* Left half filled */}
      <path
        d="M16 1.5 A14.5 14.5 0 0 0 16 30.5 L16 1.5 Z"
        fill="#2C5F4E"
      />

      {/* Two horizontal ledger lines across the full circle */}
      <line x1="5" y1="11" x2="27" y2="11" stroke="#2C5F4E" strokeWidth="1.25" />
      <line x1="5" y1="21" x2="27" y2="21" stroke="#2C5F4E" strokeWidth="1.25" />

      {/* Vertical centre divider */}
      <line x1="16" y1="1.5" x2="16" y2="30.5" stroke="#2C5F4E" strokeWidth="1.25" />
    </svg>
  )
}

export function TaxMateWordmark({ size = 32, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <TaxMateMark size={size} />
      <span
        style={{
          fontSize: size * 0.5625,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: '#1A1A1A',
        }}
      >
        TaxMate
      </span>
    </div>
  )
}

export default TaxMateMark
