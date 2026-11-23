import { WarningCircleIcon } from '@phosphor-icons/react'

export interface ErrorInfo {
  message: string
  details: string[]
}

export default function ErrorBox({ error }: { error: ErrorInfo | null }) {
  if (!error) return null
  return (
    <div className="error-box" role="alert">
      <p>
        <WarningCircleIcon size={20} weight="fill" aria-hidden />
        {error.message}
      </p>
      {error.details.length > 0 && (
        <ul>
          {error.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
