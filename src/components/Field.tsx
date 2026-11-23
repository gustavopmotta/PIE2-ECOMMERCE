import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  hint?: string
}

export default function Field({ id, label, error, hint, ...input }: FieldProps) {
  const messageId = error ? `${id}-erro` : hint ? `${id}-dica` : undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={messageId} {...input} />
      {error ? (
        <p id={messageId} className="field__error">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
