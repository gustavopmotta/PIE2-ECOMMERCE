import { ImageIcon } from '@phosphor-icons/react'

// Foto do produto. Sem foto cadastrada, mostra um espaço neutro.
// As fotos podem ficar em public/produtos/ (ex.: image: '/produtos/panela.jpg').
export default function ProductTile({ image, small = false }: { image?: string; small?: boolean }) {
  return (
    <div className={`tile${small ? ' tile--small' : ''}`} aria-hidden>
      {image ? <img src={image} alt="" loading="lazy" /> : <ImageIcon size={small ? 22 : 36} weight="thin" />}
    </div>
  )
}
