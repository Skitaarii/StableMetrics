import logo from '/imgs/haru-logo.gif'
import { LogIn } from 'lucide-react'

export default function Header({ title }) {
  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />
      <h1>{title}</h1>
      <LogIn size={48} className="login" strokeWidth={1.5} />
    </header>
  )
}