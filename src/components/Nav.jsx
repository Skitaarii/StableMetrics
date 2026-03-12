import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'


export default function Nav({ links }) {
  const [open, setOpen] = useState(false)

  return (
    <nav aria-label="navigation-principale">
      <button
        className="hamburger"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={33} /> : <Menu size={33} />}
      </button>
      <ul className={open ? 'open' : ''}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}