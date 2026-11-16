import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import StoreLayout from './components/StoreLayout.tsx'
import Cart from './pages/Cart.tsx'
import Catalog from './pages/Catalog.tsx'
import NotFound from './pages/NotFound.tsx'
import Login from './pages/admin/Login.tsx'
import Orders from './pages/admin/Orders.tsx'
import Overview from './pages/admin/Overview.tsx'
import Products from './pages/admin/Products.tsx'

export default function App() {
  return (
    <Routes>
      {/* Área do cliente */}
      <Route element={<StoreLayout />}>
        <Route index element={<Catalog />} />
        <Route path="carrinho" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Área do administrador */}
      <Route path="admin/login" element={<Login />} />
      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="produtos" element={<Products />} />
        <Route path="pedidos" element={<Orders />} />
      </Route>
    </Routes>
  )
}
