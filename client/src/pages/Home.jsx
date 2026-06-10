import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [
  { to: '/characters', label: 'Characters' },
  { to: '/gambling', label: 'Gambling' },
]

const GET_CHARACTERS = gql`
  query {
    characters {
      id
      name
      image
      umapyoiId
    }
  }
`

function pickRandom(list, currentId) {
  const choices = list.filter(c => c.id !== currentId)
  return choices[Math.floor(Math.random() * choices.length)] ?? list[0]
}

export default function Home() {
  const { data } = useQuery(GET_CHARACTERS)
  const characters = data?.characters ?? []

  const [featured, setFeatured] = useState(null)

  // Set initial featured once characters load
  if (characters.length > 0 && !featured) {
    setFeatured(pickRandom(characters, null))
  }

  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>
        <section className="home-featured">

          <div className="home-actions">
            <h2>Trainer Hub</h2>
            <div className="home-buttons">
              <Link to="/my-profile" className="primary-btn">My trainer profile</Link>
              <Link to="/trainers" className="secondary-btn">Browse trainers</Link>
            </div>
          </div>

          <div className="home-spotlight">
            <h2>Featured Uma</h2>
            {!featured ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
            ) : (
              <>
                <Link to={`/characters/${featured.id}`} className="home-spotlight-link">
                  <img
                    src={featured.image}
                    alt={featured.name}
                    className="home-spotlight-img"
                  />
                  <p className="home-spotlight-name">{featured.name}</p>
                </Link>
                <button
                  className="home-random-btn"
                  onClick={() => setFeatured(pickRandom(characters, featured.id))}
                >
                  ✦ Random
                </button>
              </>
            )}
          </div>

        </section>
      </main>
      <Footer />
    </>
  )
}