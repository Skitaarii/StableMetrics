import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import StatBar from '../components/StatBar'

const NAV_LINKS = [
  { to: '/', label: 'Home page' },
  { to: '/characters', label: 'All characters' },
]

export default function CharacterDetail() {
  const { id } = useParams()
  const [character, setCharacter] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ character(id: "${id}") {
          id name title rarity terrain lengths runningStyle
          image videoId lore horseBackground
          stats { speed stamina power guts wit }
          careerRecord { totalRaces wins winRate gradeIWins majorTitles }
          raceHistory { date race distance position }
        }}`
      }),
    })
      .then(r => r.json())
      .then(data => setCharacter(data.data.character))
  }, [id])

  if (!character) {
    return (
      <>
        <Header title="CHARACTER" />
        <Nav links={NAV_LINKS} />
        <main>
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Loading... <Link to="/characters">Back to list</Link>
          </p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header title="CHARACTER" />
      <Nav links={NAV_LINKS} />
      <main className="profile-section">
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${character.videoId}?autoplay=1&mute=1&loop=1&playlist=${character.videoId}&modestbranding=1&rel=0`}
            title="character-intro-video"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <section>
          <div className="profile-summary">
            <h2 className="character-name">{character.name}</h2>
            <p className="character-title">{character.title}</p>
            <div className="quick-stats">
              <div><span className="label">Rarity</span><span className="value">{character.rarity}</span></div>
              <div><span className="label">Terrain</span><span className="value">{character.terrain}</span></div>
              <div><span className="label">Preferred Lengths</span><span className="value">{character.lengths}</span></div>
              <div><span className="label">Running Style</span><span className="value">{character.runningStyle}</span></div>
            </div>
          </div>
        </section>
        <section className="uma-section">
          <h3>Uma Musume Profile</h3>
          <article>
            <h4>Lore</h4>
            <p>{character.lore}</p>
          </article>
          <article>
            <h4>Base stats</h4>
            <ul>
              <StatBar label="Speed" percent={character.stats.speed} />
              <StatBar label="Stamina" percent={character.stats.stamina} />
              <StatBar label="Power" percent={character.stats.power} />
              <StatBar label="Guts" percent={character.stats.guts} />
              <StatBar label="Wit" percent={character.stats.wit} />
            </ul>
          </article>
        </section>
        <section className="horse-section">
          <h3>Race Horse Profile</h3>
          <article>
            <h4>Background</h4>
            <p>{character.horseBackground}</p>
          </article>
          <article>
            <h4>Career Record</h4>
            <ul>
              <li>Total Races: {character.careerRecord.totalRaces}</li>
              <li>Wins: {character.careerRecord.wins}</li>
              <li>Win Rate: {character.careerRecord.winRate}</li>
              <li>Grade I Wins: {character.careerRecord.gradeIWins}</li>
              <li>Major Titles: {character.careerRecord.majorTitles.join(', ')}</li>
            </ul>
          </article>
          <article>
            <h4>Race History</h4>
            <table>
              <thead>
                <tr><th>Date</th><th>Race</th><th>Distance</th><th>Position</th></tr>
              </thead>
              <tbody>
                {character.raceHistory.map((race, i) => (
                  <tr key={i}>
                    <td>{race.date}</td>
                    <td>{race.race}</td>
                    <td>{race.distance}</td>
                    <td>{race.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      </main>
      <Footer />
    </>
  )
}