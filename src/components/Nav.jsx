import { Link } from 'react-router-dom'

export default function Nav({ links }) {
  return (
    <nav aria-label="navigation-principale">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
