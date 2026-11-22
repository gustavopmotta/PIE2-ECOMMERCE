import { Link } from 'react-router-dom'
import MugIllustration from '../components/MugIllustration.tsx'

export default function NotFound() {
  return (
    <div className="empty">
      <MugIllustration className="empty__art" />
      <h1>Página não encontrada</h1>
      <p>O endereço pode ter mudado ou sido digitado errado.</p>
      <Link to="/" className="button">
        Ir para o catálogo
      </Link>
    </div>
  )
}
