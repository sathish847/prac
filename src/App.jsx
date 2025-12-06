import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Loading from './components/Loading'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import Properties from './components/Properties'
import Facilities from './components/Facilities'
import Enquiry from './components/Enquiry'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  return isAuthenticated ? children : <Navigate to="/auth/sign-in" replace />
}

// Public Route Component (redirects to admin if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  return isAuthenticated ? <Navigate to="/admin" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth/sign-in"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/add"
        element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/:id"
        element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facilities"
        element={
          <ProtectedRoute>
            <Facilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facilities/add"
        element={
          <ProtectedRoute>
            <Facilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/facilities/:id"
        element={
          <ProtectedRoute>
            <Facilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries"
        element={
          <ProtectedRoute>
            <Enquiry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries/:id"
        element={
          <ProtectedRoute>
            <Enquiry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="admin-ui-theme">
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
