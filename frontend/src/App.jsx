import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import CustomerManagementPage from './pages/CustomerManagementPage'
import EmployeeDashboard from './pages/EmployeeDashboard'
import InventoryManagementPage from './pages/InventoryManagementPage'
import LoginPage from './pages/LoginPage'
import PurchaseOrderPage from './pages/PurchaseOrderPage'
import ServiceOrderListPage from './pages/ServiceOrderListPage'
import ServiceOrderPage from './pages/ServiceOrderPage'
import StockPage from './pages/StockPage'
import UnifiedWorkspacePage from './pages/UnifiedWorkspacePage'
import VehicleHistoryPage from './pages/VehicleHistoryPage'
import VehicleManagementPage from './pages/VehicleManagementPage'
import VehicleSearchPage from './pages/VehicleSearchPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/workspace" replace />} />
            <Route path="workspace" element={<UnifiedWorkspacePage />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="vehicles" element={<VehicleSearchPage />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="vehicles/:vehicleId/history" element={<VehicleHistoryPage />} />
            <Route path="service-order" element={<ServiceOrderListPage />} />
            <Route path="service-order/new" element={<ServiceOrderPage />} />
            <Route path="admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/inventory" element={
              <ProtectedRoute requireAdmin>
                <InventoryManagementPage />
              </ProtectedRoute>
            } />
            <Route path="admin/purchase-order" element={
              <ProtectedRoute requireAdmin>
                <PurchaseOrderPage />
              </ProtectedRoute>
            } />
            <Route path="admin/customers" element={
              <ProtectedRoute requireAdmin>
                <CustomerManagementPage />
              </ProtectedRoute>
            } />
            <Route path="admin/vehicles" element={
              <ProtectedRoute requireAdmin>
                <VehicleManagementPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
