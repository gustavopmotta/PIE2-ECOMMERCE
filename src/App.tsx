import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import StoreLayout from './components/StoreLayout.tsx'
import Cart from './pages/Cart.tsx'
import Catalog from './pages/Catalog.tsx'
import Login from './pages/Login.tsx'
import MyOrders from './pages/MyOrders.tsx'
import NotFound from './pages/NotFound.tsx'
import Register from './pages/Register.tsx'
import Orders from './pages/admin/Orders.tsx'
import Overview from './pages/admin/Overview.tsx'
import Products from './pages/admin/Products.tsx'
import Stock from './pages/admin/Stock.tsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<Catalog />} />
          <Route path="carrinho" element={<Cart />} />
          <Route
            path="meus-pedidos"
            element={
              <ProtectedRoute role="cliente">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="entrar" element={<Login />} />
        <Route path="cadastro" element={<Register />} />
        <Route path="admin/login" element={<Navigate to="/entrar" replace />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="produtos" element={<Products />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="estoque" element={<Stock />} />
        </Route>
      </Routes>
    </>
  )
}
