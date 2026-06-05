import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import haruChibi from '/imgs/placeholder.png'

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

export default function Register() {
  return (
    <>
      <Header title="STABLEMETRICS" />
      <Nav links={NAV_LINKS} />

      <main className="register-page">
        <div className="register-blob register-blob--pink" aria-hidden="true" />
        <div className="register-blob register-blob--blue" aria-hidden="true" />

        <div className="register-card">
          {/* Placeholder image to be replaced */}
          <div className="register-emblem" aria-hidden="true">
            <img src={haruChibi} alt="Haru Urara" className="register-emblem-img" />
          </div>

          <h2 className="register-title">Join the cult</h2>
          <p className="register-subtitle">Create your trainer account</p>

          <div className="register-form">
            {/* Trainer Name */}
            <div className="register-field">
              <label className="register-label" htmlFor="trainer-name">
                Trainer Name
              </label>
              <input
                id="trainer-name"
                type="text"
                className="register-input"
                placeholder="e.g. Bestest Trainer Ever"
                autoComplete="name"
              />
            </div>

            {/* Trainer ID */}
            <div className="register-field">
              <label className="register-label" htmlFor="trainer-id">
                Trainer ID
              </label>
              <input
                id="trainer-id"
                type="text"
                className="register-input"
                placeholder="e.g. 123 456 789 123"
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div className="register-field">
              <label className="register-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="register-input"
                placeholder="trainer@gmail.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="register-field">
              <label className="register-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="register-input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Confirm */}
            <div className="register-field">
              <label className="register-label" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="register-input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Terms */}
            <div className="register-terms">
              <label className="register-check">
                <input type="checkbox" />
                <span>I agree to the{' '}
                  <Link to="/terms" className="register-link" onClick={e => e.stopPropagation()}>
                    Terms of Service
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button type="button" className="primary-btn register-submit">
              Create Account
            </button>

            {/* Divider */}
            <div className="register-divider">
              <span>or</span>
            </div>

            {/* Login link */}
            <p className="register-login">
              Already a trainer?{' '}
              <Link to="/login" className="register-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Same question as Login for styles */}
      <style>{`
        .register-page {
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

        .register-page ~ footer {
          margin-top: 0 !important;
        }

        .register-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.45;
          pointer-events: none;
          z-index: 0;
        }

        .register-blob--pink {
          width: 40vw;
          height: 20vw;
          background: #ff7eb9;
          top: -20%;
          left: -10%;
        }

        .register-blob--blue {
          width: 40vw;
          height: 20vw;
          background: #7ed6ff;
          bottom: -20%;
          right: -10%;
        }

        .register-card {
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
          animation: register-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes register-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .register-emblem {
          margin-bottom: 1.2rem;
          display: block;
          filter: drop-shadow(0 4px 8px rgba(255, 126, 185, 0.3));
        }

        .register-emblem-img {
          height: 96px;
          width: auto;
          object-fit: contain;
        }

        .register-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.3rem;
          text-align: center;
        }

        .register-subtitle {
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          text-align: left;
        }

        .register-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .register-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .register-input {
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

        .register-input:focus {
          border-color: #ff7eb9;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 126, 185, 0.15);
        }

        .register-input::placeholder {
          color: #ccc;
        }

        .register-terms {
          font-size: 0.85rem;
          color: #666;
        }

        .register-check {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
        }

        .register-check input[type="checkbox"] {
          accent-color: #ff7eb9;
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .register-submit {
          width: 100%;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          text-align: center;
        }

        .register-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ccc;
          font-size: 0.82rem;
        }
        .register-divider::before,
        .register-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eee;
        }

        .register-login {
          text-align: center;
          font-size: 0.88rem;
          color: #888;
        }

        .register-link {
          color: #ff7eb9;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
          cursor: pointer;
        }

        .register-link:hover {
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 2rem 1.5rem;
          }

          .register-blob--pink {
            width: 120vw;
            height: 120vw;
          }

          .register-blob--blue {
            width: 110vw;
            height: 110vw;
          }
        }
      `}</style>

      <Footer />
    </>
  )
}