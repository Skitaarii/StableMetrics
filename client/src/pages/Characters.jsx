import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const GET_CHARACTERS = gql`
  query {
    characters {
      id
      name
      image
    }
  }
`

const NAV_LINKS = [
  { to: '/', label: 'Home page' },
  { to: '/gambling', label: 'Gambling' },
]

export default function Characters() {
  const [search, setSearch] = useState('')
  const { data, loading, error } = useQuery(GET_CHARACTERS)

  const characters = data?.characters ?? []
  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header title="CHARACTERS" />
      <Nav links={NAV_LINKS} />
      <main>
        <section>
          <h2>Character list</h2>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                width: '100%',
                maxWidth: '400px',
              }}
            />
          </div>
          {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
          {error && <p style={{ textAlign: 'center', color: 'red' }}>Failed to load characters.</p>}
          <div className="character-list">
            {filtered.map((character) => (
              <article key={character.id}>
                <Link to={`/characters/${character.id}`}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>{character.name}</p>
                  <img src={character.image} alt={character.name} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}