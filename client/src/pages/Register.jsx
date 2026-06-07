import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import haruChibi from '/imgs/placeholder.png'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!email || !password || !confirm) return setError('Veuillez remplir tous les champs')
    if (password !== confirm)            return setError('Les mots de passe ne correspondent pas')
    if (password.length < 6)             return setError('Mot de passe trop court (6 caractères min)')
    if (!agreed)                         return setError('Vous devez accepter les conditions d\'utilisation')

    setLoading(true)
    try {
      await register(email, password)
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />

      <main className="register-page">
        <div className="register-blob register-blob--pink" aria-hidden="true" />
        <div className="register-blob register-blob--blue" aria-hidden="true" />

        <div className="register-card">
          <div className="register-emblem" aria-hidden="true">
            <img src={haruChibi} alt="Haru Urara" className="register-emblem-img" />
          </div>

          <h2 className="register-title">Join the cult</h2>
          <p className="register-subtitle">Create your trainer account</p>

          {error && (
            <p style={{ color: '#b91c1c', background: '#fde8e8', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
          )}

          <div className="register-form">
            <div className="register-field">
              <label className="register-label" htmlFor="email">Email</label>
              <input
                id="email" type="email" className="register-input"
                placeholder="trainer@gmail.com" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="password">Password</label>
              <input
                id="password" type="password" className="register-input"
                placeholder="••••••••" autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password" type="password" className="register-input"
                placeholder="••••••••" autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
              />
            </div>

            <div className="register-terms">
              <label className="register-check">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>I agree to the{' '}
                  <Link to="/terms" className="register-link" onClick={e => e.stopPropagation()}>
                    Terms of Service
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="button"
              className="primary-btn register-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Création…' : 'Create Account'}
            </button>

            <div className="register-divider"><span>or</span></div>

            <p className="register-login">
              Already a trainer?{' '}
              <Link to="/login" className="register-link">Sign in</Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .register-page{max-width:100vw!important;width:100vw!important;margin:0!important;padding:3rem 1.5rem!important;position:relative;min-height:calc(100vh - 216px);display:flex;align-items:center;justify-content:center;overflow:hidden}
        .register-page~footer{margin-top:0!important}
        .register-blob{position:absolute;border-radius:50%;filter:blur(120px);opacity:.45;pointer-events:none;z-index:0}
        .register-blob--pink{width:40vw;height:20vw;background:#ff7eb9;top:-20%;left:-10%}
        .register-blob--blue{width:40vw;height:20vw;background:#7ed6ff;bottom:-20%;right:-10%}
        .register-card{position:relative;z-index:1;background:white;border-radius:24px;padding:2.8rem 2.4rem;width:100%;max-width:420px;box-shadow:0 4px 6px rgba(0,0,0,.04),0 20px 50px rgba(255,126,185,.18);text-align:center;animation:register-rise .4s cubic-bezier(.22,1,.36,1) both}
        @keyframes register-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .register-emblem{margin-bottom:1.2rem;display:block;filter:drop-shadow(0 4px 8px rgba(255,126,185,.3))}
        .register-emblem-img{height:96px;width:auto;object-fit:contain}
        .register-title{font-size:1.6rem;font-weight:700;color:#2c2c2c;margin-bottom:.3rem}
        .register-subtitle{color:#999;font-size:.9rem;margin-bottom:2rem}
        .register-form{display:flex;flex-direction:column;gap:1.1rem;text-align:left}
        .register-field{display:flex;flex-direction:column;gap:.4rem}
        .register-label{font-size:.82rem;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.05em}
        .register-input{width:100%;padding:.75rem 1rem;border:1.5px solid #e8e8e8;border-radius:12px;font-size:.97rem;background:#fafafa;color:#2c2c2c;transition:border-color .2s,box-shadow .2s;outline:none;box-sizing:border-box}
        .register-input:focus{border-color:#ff7eb9;background:white;box-shadow:0 0 0 3px rgba(255,126,185,.15)}
        .register-input::placeholder{color:#ccc}
        .register-terms{font-size:.85rem;color:#666}
        .register-check{display:flex;align-items:center;gap:.4rem;cursor:pointer}
        .register-check input[type=checkbox]{accent-color:#ff7eb9;width:15px;height:15px;flex-shrink:0}
        .register-submit{width:100%;border:none;font-size:1rem;font-weight:700;cursor:pointer;text-align:center}
        .register-submit:disabled{opacity:.6;cursor:not-allowed}
        .register-divider{display:flex;align-items:center;gap:.75rem;color:#ccc;font-size:.82rem}
        .register-divider::before,.register-divider::after{content:'';flex:1;height:1px;background:#eee}
        .register-login{text-align:center;font-size:.88rem;color:#888}
        .register-link{color:#ff7eb9;font-weight:600;text-decoration:none;transition:opacity .15s;cursor:pointer}
        .register-link:hover{opacity:.7}
      `}</style>

      <Footer />
    </>
  )
}