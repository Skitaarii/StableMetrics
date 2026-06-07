import logo from '/imgs/haru-logo.gif'
import { UserCircle2, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />
      <h1>{title}</h1>

      {user ? (
        <div className="header-user">
          <Link to="/my-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: 'inherit' }}>
            <UserCircle2 size={28} strokeWidth={1.5} />
            <span className="header-username">{user.email}</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div className="header-auth">
          <Link to="/login"    className="header-auth-link">Login</Link>
          <span className="header-auth-sep">/</span>
          <Link to="/register" className="header-auth-link">Register</Link>
        </div>
      )}
    </header>
  )
}