import { ImageIcon } from '@phosphor-icons/react'

export default function ProductTile({ image, small = false }: { image?: string; small?: boolean }) {
  return (
    <div className={`tile${small ? ' tile--small' : ''}`} aria-hidden>
      {image ? <img src={image} alt="" loading="lazy" /> : <ImageIcon size={small ? 22 : 36} weight="thin" />}
    </div>
  )
}
