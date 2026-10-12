import { Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './components/GuestRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MoneyActionPage from './pages/MoneyActionPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TransactionHistoryPage from './pages/TransactionHistoryPage.jsx'
import './App.css'

function NotFoundRedirect() {
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole="USER" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/deposit" element={<MoneyActionPage action="deposit" />} />
        <Route path="/withdraw" element={<MoneyActionPage action="withdraw" />} />
        <Route path="/transfer" element={<MoneyActionPage action="transfer" />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  )
}
