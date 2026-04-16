import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { TRAINERS } from '../data/trainers'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/characters', label: 'Characters' },
  { to: '/score-calculator', label: 'Score calculator' },
]

export default function TrainerList() {
  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>
        <section>
          <h2>Trainer Directory</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Browse trainers by ID and view their performance metrics.
          </p>

          <div className="trainer-grid">
            {TRAINERS.map((trainer) => (
              <div className="trainer-card" key={trainer.id}>
                <h3>{trainer.name}</h3>
                <p>ID: {trainer.trainerId}</p>
                <p>Rank: {trainer.rank}</p>
                <p className="trainer-comment-preview">{trainer.comment}</p>
                <Link to={`/trainers/${trainer.id}`} className="small-btn">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
