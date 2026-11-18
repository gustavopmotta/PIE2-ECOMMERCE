import { MinusIcon, PlusIcon } from '@phosphor-icons/react'

interface Props {
  quantity: number
  min?: number
  max: number
  label: string
  onChange: (quantity: number) => void
}

export default function QuantityStepper({ quantity, min = 0, max, label, onChange }: Props) {
  return (
    <div className="stepper" role="group" aria-label={`Quantidade de ${label}`}>
      <button type="button" onClick={() => onChange(quantity - 1)} disabled={quantity <= min} aria-label="Diminuir">
        <MinusIcon size={16} weight="bold" />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)} disabled={quantity >= max} aria-label="Aumentar">
        <PlusIcon size={16} weight="bold" />
      </button>
    </div>
  )
}
