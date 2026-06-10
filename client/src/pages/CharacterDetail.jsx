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

const UMAPYOI_API = 'https://umapyoi.net/api/v1'

function buildUmapyoiProfile(info, images) {
  // Image: first entry of the first category (Uniform), most recently uploaded
  const image = images?.[0]?.images?.[0]?.image ?? null

  // Birthday: "2/27" style
  const birthday =
    info.birth_month && info.birth_day
      ? `${info.birth_month}/${info.birth_day}`
      : null

  return {
    nameEn:   info.name_en   ?? '',
    nameJp:   info.name_jp   ?? '',
    birthday,
    height:   info.height    ?? null,
    like:     info.strengths ?? '',   // closest field - API has no explicit "like"
    dislike:  info.weaknesses ?? '',  // closest field - API has no explicit "dislike"
    image,
  }
}

export default function CharacterDetail() {
  const { id } = useParams()
  const [character, setCharacter]   = useState(null)   // from your MongoDB / GraphQL
  const [umaProfile, setUmaProfile] = useState(null)   // from Umapyoi API
  const [umaLoading, setUmaLoading] = useState(true)

  // -- 1. Fetch your DB data via GraphQL --------------------------------------
  useEffect(() => {
    fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ character(id: "${id}") {
          id umapyoiId videoId lore rarity terrain lengths runningStyle racewear
        }}`
      }),
    })
      .then(r => r.json())
      .then(data => setCharacter(data.data.character))
  }, [id])

  // -- 2. Once we have the umapyoiId, fetch live data from Umapyoi ------------
  useEffect(() => {
    if (!character?.umapyoiId) return
    setUmaLoading(true)

    Promise.all([
      fetch(`${UMAPYOI_API}/character/${character.umapyoiId}`).then(r => r.json()),
      fetch(`${UMAPYOI_API}/character/images/${character.umapyoiId}`).then(r => r.json()),
    ])
      .then(([info, images]) => setUmaProfile(buildUmapyoiProfile(info, images)))
      .catch(err => console.error('Umapyoi fetch failed:', err))
      .finally(() => setUmaLoading(false))
  }, [character?.umapyoiId])

  // -- Loading state ----------------------------------------------------------
  if (!character) {
    return (
      <>
        <Header title="CHARACTER" />
        <Nav links={NAV_LINKS} />
        <main>
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Loading… <Link to="/characters">Back to list</Link>
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

        {/* Video */}
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
            {/* Names - from Umapyoi */}
            <h2 className="character-name">
              {umaProfile?.nameEn ?? '…'}
            </h2>
            {umaProfile?.nameJp && (
              <p className="character-name-jp">{umaProfile.nameJp}</p>
            )}

            {/* Game stats - from your DB */}
            <div className="quick-stats">
              <div><span className="label">Rarity</span><span className="value">{character.rarity}</span></div>
              <div><span className="label">Terrain</span><span className="value">{character.terrain}</span></div>
              <div><span className="label">Preferred Lengths</span><span className="value">{character.lengths}</span></div>
              <div><span className="label">Running Style</span><span className="value">{character.runningStyle}</span></div>
            </div>
          </div>
        </section>

        {/* Character image - from Umapyoi */}
        {umaLoading ? (
          <p style={{ textAlign: 'center' }}>Loading profile…</p>
        ) : (
          <div className="character-image-wrapper" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '0 1rem',
          }}>
            {umaProfile?.image && (
              <img 
                src={umaProfile.image} 
                alt={umaProfile.nameEn} 
                style={{ maxWidth: '340px', width: '100%', height: 'auto', flexShrink: 1 }} 
              />
            )}
            {character.racewear && (
              <img 
                src={character.racewear} 
                alt={`${umaProfile.nameEn ?? ''} racewear`} 
                style={{ maxWidth: '340px', width: '100%', height: 'auto', flexShrink: 1 }} 
              />
            )}
          </div>
        )}

        <section className="uma-section">
          <h3>Uma Musume Profile</h3>

          {/* Lore - from DB */}
          <article>
            <h4>Lore</h4>
            <p>{character.lore}</p>
          </article>

          {/* Live profile info - from Umapyoi */}
          {umaProfile && (
            <article>
              <h4>Profile</h4>
              <ul className="profile-facts">
                {umaProfile.birthday && (
                  <li><span className="label">Birthday</span><span className="value">{umaProfile.birthday}</span></li>
                )}
                {umaProfile.height && (
                  <li><span className="label">Height</span><span className="value">{umaProfile.height} cm</span></li>
                )}
                {umaProfile.like && (
                  <li><span className="label">Strengths</span><span className="value">{umaProfile.like}</span></li>
                )}
                {umaProfile.dislike && (
                  <li><span className="label">Weaknesses</span><span className="value">{umaProfile.dislike}</span></li>
                )}
              </ul>
            </article>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}