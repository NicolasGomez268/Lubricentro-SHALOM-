import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import CustomerManagementPage from './pages/CustomerManagementPage'
import EmployeeDashboard from './pages/EmployeeDashboard'
import InventoryManagementPage from './pages/InventoryManagementPage'
import LoginPage from './pages/LoginPage'
import StockPage from './pages/StockPage'
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="vehicles" element={<VehicleSearchPage />} />
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
