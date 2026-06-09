import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home            from './pages/Home'
import Characters      from './pages/Characters'
import CharacterDetail from './pages/CharacterDetail'
import TrainerList     from './pages/TrainerList'
import TrainerProfile  from './pages/TrainerProfile'
import MyProfile       from './pages/MyProfile'
import Gambling        from './pages/Gambling'
import Login           from './pages/Login'
import Register        from './pages/Register'
import Terms           from './pages/Terms'

// Only accessible when NOT logged in
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

// Only accessible when logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"                 element={<Home />} />
      <Route path="/characters"       element={<Characters />} />
      <Route path="/characters/:id"   element={<CharacterDetail />} />
      <Route path="/trainers"         element={<TrainerList />} />
      <Route path="/trainers/:id"     element={<TrainerProfile />} />
      <Route path="/gambling"         element={<Gambling />} />
      <Route path="/terms"            element={<Terms />} />

      {/* Protected routes */}
      <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

      {/* Guest-only routes */}
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
    </Routes>
  )
}