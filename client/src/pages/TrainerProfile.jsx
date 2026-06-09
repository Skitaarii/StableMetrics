import { useParams, Link } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/characters', label: 'Characters' },
  { to: '/trainers', label: 'Browse trainers' },
]

const GET_TRAINER = gql`
  query GetTrainer($id: ID!) {
    trainer(id: $id) {
      id name trainerId comment rank
      followers totalTrained highestScore coins
      team { uma scenario score }
      supportSetup
    }
  }
`

export default function TrainerProfile() {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_TRAINER, { variables: { id }, fetchPolicy: 'network-only' })

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading…</p>
  if (error)   return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Error loading trainer</p>

  const trainer = data?.trainer
  if (!trainer) return (
    <>
      <Header title="STABLEMETRICS" /><Nav links={NAV_LINKS} />
      <main><p style={{ textAlign: 'center', marginTop: '2rem' }}>
        Trainer not found. <Link to="/trainers">Back to directory</Link>
      </p></main>
      <Footer />
    </>
  )

  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>

        <section className="profile-summary">
          <h2 className="character-name">Trainer: {trainer.name}</h2>
          <p className="character-title">ID: {trainer.trainerId}</p>

          <div className="trainer-comment" style={{ margin: '1rem 0' }}>
            <span className="label">Comment</span>
            <p>{trainer.comment}</p>
          </div>

          <div className="quick-stats">
            <div><span className="label">Rank</span><span className="value">{trainer.rank}</span></div>
            <div><span className="label">Followers</span><span className="value">{trainer.followers}</span></div>
            <div><span className="label">Total Trained</span><span className="value">{trainer.totalTrained}</span></div>
            <div><span className="label">Highest Score</span><span className="value">{trainer.highestScore?.toLocaleString()}</span></div>
            <div><span className="label">Coins</span><span className="value">🪙 {trainer.coins?.toLocaleString()}</span></div>
          </div>
        </section>

        <section className="horse-section">
          <h3>Team</h3>
          {trainer.team.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No team data yet.</p>
          ) : (
            <table>
              <thead><tr><th>Uma</th><th>Scenario</th><th>Score</th></tr></thead>
              <tbody>
                {trainer.team.map((e, i) => (
                  <tr key={i}><td>{e.uma}</td><td>{e.scenario}</td><td>{e.score?.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="uma-section">
          <h3>Main Support Setup</h3>
          {trainer.supportSetup.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No support setup yet.</p>
          ) : (
            <ul>{trainer.supportSetup.map((c, i) => <li key={i}>{c}</li>)}</ul>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}