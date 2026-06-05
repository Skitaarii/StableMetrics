import logo from '/imgs/haru-logo.gif'
import { LogIn, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header({ title, user = null }) {
  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />
      <h1>{title}</h1>

      {user ? (
        <div className="header-user">
          <UserCircle2 size={28} strokeWidth={1.5} />
          <span className="header-username">{user.name}</span>
        </div>
      ) : (
        <div className="header-auth">
          <Link to="/login" className="header-auth-link">Login</Link>
          <span className="header-auth-sep">/</span>
          <Link to="/register" className="header-auth-link">Register</Link>
        </div>
      )}
    </header>
  )
}