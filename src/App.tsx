import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/ui/Navbar'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import PortfolioDetailPage from './pages/PortfolioDetailPage'
import StudiesPage from './pages/StudiesPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import UploadPortfolioPage from './pages/UploadPortfolioPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--accent)' }}>로딩중...</div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/portfolio"     element={<PortfolioPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
        <Route path="/studies"       element={<StudiesPage />} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/upload"        element={<ProtectedRoute><UploadPortfolioPage /></ProtectedRoute>} />
        <Route path="/admin"         element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
