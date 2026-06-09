import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/characters', label: 'Characters' },
  { to: '/trainers', label: 'Browse trainers' },
]

const GQL = 'http://localhost:4000/graphql'

const input = {
  background: 'none', border: 'none', borderBottom: '1.5px solid #e8e8e8',
  fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit',
  width: '100%', padding: '0.1rem 0.2rem', outline: 'none',
  cursor: 'text',
}
const textarea = {
  ...input,
  resize: 'vertical', display: 'block', lineHeight: '1.5',
}

export default function MyProfile() {
  const { user, refreshMe } = useAuth()

  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(null)
  const [error,   setError]   = useState(null)

  const [form, setForm] = useState({
    name:         '',
    trainerId:    '',
    rank:         '',
    comment:      '',
    followers:    '',
    totalTrained: '',
    highestScore: '',
    supportSetup: '',
  })

  const [team, setTeam] = useState([]) // [{ uma, scenario, score }]

  // Pre-fill with existing data
  useEffect(() => {
    if (!user?.id) return
    fetch(GQL, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { trainer(id: "${user.id}") {
          name trainerId rank comment
          followers totalTrained highestScore supportSetup
          team { uma scenario score }
        }}`,
      }),
    })
      .then(r => r.json())
      .then(json => {
        const t = json.data?.trainer
        if (!t) return
        setForm({
          name:         t.name         ?? '',
          trainerId:    t.trainerId    ?? '',
          rank:         t.rank         ?? '',
          comment:      t.comment      ?? '',
          followers:    t.followers    ?? '',
          totalTrained: t.totalTrained ?? '',
          highestScore: t.highestScore ?? '',
          supportSetup: (t.supportSetup ?? []).join('\n'),
        })
        setTeam(t.team ?? [])
      })
  }, [user])

  const set = (key) => (e) => {
    setSuccess(null)
    setError(null)
    setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return setError('Trainer name is required.')
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await fetch(GQL, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation UpdateProfile(
            $name:String $trainerId:String $comment:String $rank:String
            $followers:Int $totalTrained:Int $highestScore:Int $supportSetup:[String]
            $team:[TeamEntryInput]
          ) {
            updateProfile(name:$name trainerId:$trainerId comment:$comment rank:$rank
              followers:$followers totalTrained:$totalTrained
              highestScore:$highestScore supportSetup:$supportSetup team:$team) { id }
          }`,
          variables: {
            name:         form.name.trim(),
            trainerId:    form.trainerId.trim() || '—',
            rank:         form.rank.trim()      || 'Unranked',
            comment:      form.comment.trim()   || '',
            followers:    parseInt(form.followers)    || 0,
            totalTrained: parseInt(form.totalTrained) || 0,
            highestScore: parseInt(form.highestScore) || 0,
            supportSetup: form.supportSetup.split('\n').map(s => s.trim()).filter(Boolean),
            team:         team.map(e => ({
              uma:      e.uma      ?? '',
              scenario: e.scenario ?? '',
              score:    parseInt(e.score) || 0,
            })),
          },
        }),
      })
      const json = await res.json()
      if (json.errors) throw new Error(json.errors[0].message)
      await refreshMe()
      setSuccess('Saved!')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const supportList = form.supportSetup.split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />
      <main>

        <section className="profile-summary">

          {/* Name & save button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 className="character-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Trainer:&nbsp;
              <input
                style={{ ...input, fontSize: 'inherit', fontWeight: 'inherit', width: 220 }}
                placeholder="Your name"
                value={form.name}
                onChange={set('name')}
              />
            </h2>
            <button className="small-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </div>

          {/* Feedback */}
          {error   && <p style={{ textAlign: 'center', color: '#b91c1c', background: '#fde8e8', borderRadius: 8, padding: '0.4rem 0.75rem', margin: '0.5rem auto', maxWidth: 400, fontSize: '0.88rem', fontWeight: 600 }}>{error}</p>}
          {success && <p style={{ textAlign: 'center', color: '#1a7a40', background: '#e6f9ee', borderRadius: 8, padding: '0.4rem 0.75rem', margin: '0.5rem auto', maxWidth: 400, fontSize: '0.88rem', fontWeight: 600 }}>{success}</p>}

          {/* Trainer ID */}
          <p className="character-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            ID:&nbsp;
            <input style={{ ...input, width: 180, textAlign: 'center' }}
              placeholder="123 456 789"
              value={form.trainerId}
              onChange={set('trainerId')}
            />
          </p>

          {/* Comment */}
          <div className="trainer-comment" style={{ margin: '1rem 0' }}>
            <span className="label">Comment</span>
            <textarea
              style={{ ...textarea, marginTop: '0.3rem' }}
              rows={3}
              placeholder="Introduce yourself…"
              value={form.comment}
              onChange={set('comment')}
            />
          </div>

          {/* Quick stats */}
          <div className="quick-stats">
            <div>
              <span className="label">Rank</span>
              <input style={{ ...input, textAlign: 'center' }} placeholder="Unranked"
                value={form.rank} onChange={set('rank')} />
            </div>
            <div>
              <span className="label">Followers</span>
              <input style={{ ...input, textAlign: 'center' }} type="number" placeholder="0"
                value={form.followers} onChange={set('followers')} />
            </div>
            <div>
              <span className="label">Total Trained</span>
              <input style={{ ...input, textAlign: 'center' }} type="number" placeholder="0"
                value={form.totalTrained} onChange={set('totalTrained')} />
            </div>
            <div>
              <span className="label">Highest Score</span>
              <input style={{ ...input, textAlign: 'center' }} type="number" placeholder="0"
                value={form.highestScore} onChange={set('highestScore')} />
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="horse-section">
          <h3>Team</h3>
          <table>
            <thead>
              <tr>
                <th>Uma</th>
                <th>Scenario</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {team.map((entry, i) => (
                <tr key={i}>
                  <td><input style={{ ...input, width: '100%' }} placeholder="Uma name"
                    value={entry.uma} onChange={e => setTeam(t => t.map((r, j) => j === i ? { ...r, uma: e.target.value } : r))} /></td>
                  <td><input style={{ ...input, width: '100%' }} placeholder="Scenario"
                    value={entry.scenario} onChange={e => setTeam(t => t.map((r, j) => j === i ? { ...r, scenario: e.target.value } : r))} /></td>
                  <td><input style={{ ...input, width: '100%', textAlign: 'center' }} type="number" placeholder="0"
                    value={entry.score} onChange={e => setTeam(t => t.map((r, j) => j === i ? { ...r, score: e.target.value } : r))} /></td>
                  <td>
                    <button onClick={() => setTeam(t => t.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '1rem' }}
                      title="Remove row">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button className="small-btn"
              onClick={() => setTeam(t => [...t, { uma: '', scenario: '', score: '' }])}>
              + Add row
            </button>
          </div>
        </section>

        {/* Support setup */}
        <section className="uma-section">
          <h3>Main Support Setup</h3>
          <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            One card per line
          </p>
          <textarea
            style={{ ...textarea, width: '100%', minHeight: 120, borderBottom: 'none', border: '1.5px solid #e8e8e8', borderRadius: 10, padding: '0.6rem 0.8rem', boxSizing: 'border-box' }}
            placeholder={'Speed SSR Vodka\nStamina SR Rice Shower\n…'}
            value={form.supportSetup}
            onChange={set('supportSetup')}
          />
          {supportList.length > 0 && (
            <ul style={{ marginTop: '0.75rem' }}>
              {supportList.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}