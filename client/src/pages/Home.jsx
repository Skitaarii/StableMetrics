import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [
  { to: '/characters', label: 'Characters' },
  { to: '/gambling', label: 'Gambling' },
]

export default function Home() {
  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>
        <section className="home-actions">
          <h2>Trainer Hub</h2>
          <div className="home-buttons">
            <Link to="/my-profile" className="primary-btn">
              My trainer profile
            </Link>
            <Link to="/trainers" className="secondary-btn">
              Browse trainers
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}