import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

export default function Characters() {
  const [characters, setCharacters] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ characters { id name image } }` }),
    })
      .then(r => r.json())
      .then(data => {
        setCharacters(data.data.characters)
      })
      .catch(err => console.error('FETCH ERROR:', err))
  }, [])

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <header>
        <h1 className="small_title">CHARACTERS</h1>
        <div className="controls" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
            }}
          />
        </div>
      </header>
      <Nav links={NAV_LINKS} />
      <main>
        <section>
          <h2>Character list</h2>
          <div className="character-list">
            {filtered.map((character) => (
              <article key={character.id}>
                <Link to={`/characters/${character.id}`}>
                  <p>{character.name}</p>
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