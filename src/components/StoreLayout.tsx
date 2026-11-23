import { Outlet } from 'react-router-dom'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import TopBar from './TopBar.tsx'

export default function StoreLayout() {
  return (
    <div className="store">
      <TopBar />
      <Header />
      <main className="container store__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
