const HANDLE = 'M172 112h22a28 28 0 0 1 0 56h-22'

export default function MugIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={`mug ${className}`.trim()} viewBox="0 0 260 240" aria-hidden="true" focusable="false">
      <ellipse className="mug__shadow" cx="118" cy="226" rx="92" ry="10" />
      <path className="mug__steam" d="M88 62c-12-12 12-20 0-34M115 56c-12-12 12-20 0-34M142 62c-12-12 12-20 0-34" />
      <path className="mug__handle-outline" d={HANDLE} />
      <path className="mug__handle" d={HANDLE} />
      <path className="mug__body" d="M50 86V190q0 22 22 22h86q22 0 22-22V86z" />
      <ellipse className="mug__rim" cx="115" cy="86" rx="65" ry="13" />
      <ellipse className="mug__coffee" cx="115" cy="89" rx="51" ry="7" />
      <rect className="mug__shine" x="64" y="108" width="12" height="74" rx="6" />
      <path
        className="mug__print"
        d="M97 128h36q12 0 12 12l7 24q3 12-8 13q-7 1-12-7l-4-6h-26l-4 6q-5 8-12 7q-11-1-8-13l7-24q0-12 12-12z"
      />
      <rect className="mug__dot" x="94" y="139" width="8" height="16" rx="2" />
      <rect className="mug__dot" x="90" y="143" width="16" height="8" rx="2" />
      <circle className="mug__dot" cx="131" cy="143" r="4.5" />
      <circle className="mug__dot" cx="140" cy="151" r="4.5" />
      <path className="mug__spark" d="M216 48l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
      <path className="mug__spark" d="M28 128l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
    </svg>
  )
}
