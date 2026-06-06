import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/characters', label: 'Characters' },
  { to: '/score-calculator', label: 'Score calculator' },
]

export default function TrainerList() {
  const [trainers, setTrainers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ trainers { id name trainerId rank comment } }` }),
    })
      .then(r => r.json())
      .then(data => setTrainers(data.data.trainers))
      .catch(err => console.error('FETCH ERROR:', err))
  }, [])

  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>
        <section>
          <h2>Trainer Directory</h2>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Browse trainers by ID and view their performance metrics.
          </p>

          {user && !user.hasProfile && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{ color: '#888', marginBottom: '0.5rem' }}>You don't have a trainer profile yet.</p>
              <Link to="/my-profile" className="primary-btn" style={{ display: 'inline-block' }}>
                + Create my profile
              </Link>
            </div>
          )}

          <div className="trainer-grid">
            {trainers.map((trainer) => (
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