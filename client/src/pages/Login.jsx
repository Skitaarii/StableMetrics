import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import haruChibi from '/imgs/Haru_Urara_Chibi1-2.webp'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!email || !password) return setError('Veuillez remplir tous les champs')
    setLoading(true)
    try {
      await login(email, password)
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

      <main className="login-page">
        <div className="login-blob login-blob--pink" aria-hidden="true" />
        <div className="login-blob login-blob--blue" aria-hidden="true" />

        <div className="login-card">
          <div className="login-emblem" aria-hidden="true">
            <img src={haruChibi} alt="Haru Urara" className="login-emblem-img" />
          </div>

          <h2 className="login-title">Welcome back, Trainer!</h2>
          <p className="login-subtitle">Sign in to access your account</p>

          {error && (
            <p style={{ color: '#b91c1c', background: '#fde8e8', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
          )}

          <div className="login-form">
            <div className="login-field">
              <label className="login-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="trainer@gmail.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              type="button"
              className="primary-btn login-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Connexion…' : 'Sign in'}
            </button>

            <div className="login-divider"><span>or</span></div>

            <p className="login-register">
              New trainer?{' '}
              <Link to="/register" className="login-link">Create an account</Link>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .login-page{max-width:100vw!important;width:100vw!important;margin:0!important;padding:3rem 1.5rem!important;position:relative;min-height:calc(100vh - 216px);display:flex;align-items:center;justify-content:center;overflow:hidden}
        .login-page~footer{margin-top:0!important}
        .login-blob{position:absolute;border-radius:50%;filter:blur(120px);opacity:.45;pointer-events:none;z-index:0}
        .login-blob--pink{width:40vw;height:20vw;background:#ff7eb9;top:-20%;left:-10%}
        .login-blob--blue{width:40vw;height:20vw;background:#7ed6ff;bottom:-20%;right:-10%}
        .login-card{position:relative;z-index:1;background:white;border-radius:24px;padding:2.8rem 2.4rem;width:100%;max-width:420px;box-shadow:0 4px 6px rgba(0,0,0,.04),0 20px 50px rgba(255,126,185,.18);text-align:center;animation:login-rise .4s cubic-bezier(.22,1,.36,1) both}
        @keyframes login-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .login-emblem{margin-bottom:1.2rem;display:block;filter:drop-shadow(0 4px 8px rgba(255,126,185,.3))}
        .login-emblem-img{height:96px;width:auto;object-fit:contain}
        .login-title{font-size:1.6rem;font-weight:700;color:#2c2c2c;margin-bottom:.3rem}
        .login-subtitle{color:#999;font-size:.9rem;margin-bottom:2rem}
        .login-form{display:flex;flex-direction:column;gap:1.1rem;text-align:left}
        .login-field{display:flex;flex-direction:column;gap:.4rem}
        .login-label{font-size:.82rem;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.05em}
        .login-input{width:100%;padding:.75rem 1rem;border:1.5px solid #e8e8e8;border-radius:12px;font-size:.97rem;background:#fafafa;color:#2c2c2c;transition:border-color .2s,box-shadow .2s;outline:none;box-sizing:border-box}
        .login-input:focus{border-color:#ff7eb9;background:white;box-shadow:0 0 0 3px rgba(255,126,185,.15)}
        .login-input::placeholder{color:#ccc}
        .login-submit{width:100%;border:none;font-size:1rem;font-weight:700;cursor:pointer;text-align:center}
        .login-submit:disabled{opacity:.6;cursor:not-allowed}
        .login-divider{display:flex;align-items:center;gap:.75rem;color:#ccc;font-size:.82rem}
        .login-divider::before,.login-divider::after{content:'';flex:1;height:1px;background:#eee}
        .login-register{text-align:center;font-size:.88rem;color:#888}
        .login-link{color:#ff7eb9;font-weight:600;text-decoration:none;transition:opacity .15s}
        .login-link:hover{opacity:.7}
      `}</style>

      <Footer />
    </>
  )
}