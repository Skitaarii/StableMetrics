import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import haruChibi from '/imgs/Haru_Urara_Chibi1-2.webp'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

export default function Login() {
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

          <div className="login-form">
            {/* Trainer ID */}
            <div className="login-field">
              <label className="login-label" htmlFor="trainer-id">
                Trainer name
              </label>
              <input
                id="trainer-id"
                type="text"
                className="login-input"
                placeholder="e.g. VeryResearchedName123"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Remember me + forgor */}
            <div className="login-row">
              <label className="login-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span className="login-forgot">Forgot password?</span>
            </div>

            {/* Submit */}
            <button type="button" className="primary-btn login-submit">
              Sign in
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span>or</span>
            </div>

            {/* Register link */}
            <p className="login-register">
              New trainer?{' '}
              <Link to="/register" className="login-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>


      {/* Pas sur de si c'est mieux de le mettre comme ca ou de le mettre dans un fichier CSS a part, je vais laisser comme ca pour l'instant*/}
      <style>{`
        .login-page {
          max-width: 100vw !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 3rem 1.5rem !important;

          position: relative;
          min-height: calc(100vh - 216px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .login-page ~ footer {
          margin-top: 0 !important;
        }

        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.45;
          pointer-events: none;
          z-index: 0;
        }

        .login-blob--pink {
          width: 40vw;
          height: 20vw;
          background: #ff7eb9;
          top: -20%;
          left: -10%;
        }

        .login-blob--blue {
          width: 40vw;
          height: 20vw;
          background: #7ed6ff;
          bottom: -20%;
          right: -10%;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: white;
          border-radius: 24px;
          padding: 2.8rem 2.4rem;
          width: 100%;
          max-width: 420px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 20px 50px rgba(255, 126, 185, 0.18);
          text-align: center;
          animation: login-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes login-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .login-emblem {
          margin-bottom: 1.2rem;
          display: block;
          filter: drop-shadow(0 4px 8px rgba(255, 126, 185, 0.3));
        }

        .login-emblem-img {
          height: 96px;
          width: auto;
          object-fit: contain;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.3rem;
          text-align: center;
        }

        .login-subtitle {
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          text-align: left;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .login-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e8e8e8;
          border-radius: 12px;
          font-size: 0.97rem;
          background: #fafafa;
          color: #2c2c2c;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #ff7eb9;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 126, 185, 0.15);
        }

        .login-input::placeholder {
          color: #ccc;
        }

        .login-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: #666;
        }

        .login-check {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
        }

        .login-check input[type="checkbox"] {
          accent-color: #ff7eb9;
          width: 15px;
          height: 15px;
        }

        .login-forgot {
          color: #ff7eb9;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.15s;
        }

        .login-forgot:hover {
          opacity: 0.7;
        }

        .login-submit {
          width: 100%;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          text-align: center;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ccc;
          font-size: 0.82rem;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eee;
        }

        /* Register */
        .login-register {
          text-align: center;
          font-size: 0.88rem;
          color: #888;
        }

        .login-link {
          color: #ff7eb9;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .login-link:hover {
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-blob--pink {
            width: 120vw;
            height: 120vw;
          }

          .login-blob--blue {
            width: 110vw;
            height: 110vw;
          }
        }
      `}</style>

      <Footer />
    </>
  )
}