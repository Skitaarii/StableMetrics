import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// --- Constants ----------------------------------------------------------------

const SOCKET_URL       = 'http://localhost:4000'
const STARTING_BALANCE = 1000
const BETTING_DURATION = 15
const QUICK_AMOUNTS    = [50, 100, 250, 500]

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

function calcPayout(amount, odds) { return Math.floor(amount * odds) }

// --- Betting Phase -----------------------------------------------------------

function BettingPhase({ timeLeft, odds, balance, bet, onPlaceBet, racers }) {
  const [selected, setSelected] = useState(bet?.racerId ?? null)
  const [amount,   setAmount]   = useState(bet ? String(bet.amount) : '')

  const oddsKey = JSON.stringify(odds)
  useEffect(() => {
    setSelected(null)
    setAmount('')
  }, [oddsKey])

  const timerPct   = (timeLeft / BETTING_DURATION) * 100
  const timerColor = timeLeft <= 5 ? '#ff6b6b' : timeLeft <= 10 ? '#ffd166' : '#ff7eb9'
  const parsedAmt  = parseInt(amount, 10)
  const canBet     = selected && parsedAmt > 0 && parsedAmt <= balance

  return (
    <div className="g-betting-layout">
      <div className="g-topbar">
        <div className="g-topbar-left">
          <span className="g-topbar-label">Time remaining</span>
          <div className="g-timer-bar-wrap">
            <div className="g-timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>
          <span className="g-timer-text" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
        <div className="g-topbar-right">
          <span className="g-topbar-label">Your balance</span>
          <span className="g-balance">{balance.toLocaleString()} coins</span>
        </div>
      </div>

      <div className="g-columns">
        <div className="g-panel">
          <h3 className="g-panel-title">Racers</h3>
          <div className="g-racer-list">
            {racers.map(r => (
              <button
                key={r.id}
                className={`g-racer-row ${selected === r.id ? 'selected' : ''}`}
                onClick={() => setSelected(r.id)}
                style={{ '--rc': r.color }}
              >
                <div className="g-racer-info">
                  <span className="g-racer-name">{r.name}</span>
                  <span className="g-racer-odd">x{odds[r.id]}</span>
                </div>
                {r.image && <img src={r.image} alt={r.name} className="g-racer-img" />}
              </button>
            ))}
          </div>
        </div>

        <div className="g-panel">
          <h3 className="g-panel-title">Bets</h3>
          <div className="g-bet-panel">
            <div className="g-quick-amounts">
              {QUICK_AMOUNTS.map(v => (
                <button
                  key={v}
                  className={`g-quick-btn ${parsedAmt === v ? 'active' : ''}`}
                  onClick={() => setAmount(String(Math.min(v, balance)))}
                  disabled={v > balance}
                >{v}</button>
              ))}
              <button
                className={`g-quick-btn all-in ${parsedAmt === balance ? 'active' : ''}`}
                onClick={() => setAmount(String(balance))}
              >ALL IN</button>
            </div>
            <input
              type="number"
              className="g-custom-input"
              placeholder="Custom amount..."
              min={1} max={balance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="g-current-bet">
              {selected && parsedAmt > 0
                ? <>Betting <strong>{parsedAmt}</strong> on <strong>{racers.find(r => r.id === selected)?.name}</strong> → potential <strong>{calcPayout(parsedAmt, odds[selected] ?? 1).toLocaleString()}</strong></>
                : <span className="g-bet-placeholder">{selected ? 'Enter an amount' : 'Select a racer first'}</span>
              }
            </div>
            <button className="g-place-btn" onClick={() => canBet && onPlaceBet(selected, parsedAmt)} disabled={!canBet}>
              {bet ? 'Update bet' : 'Place bet'}
            </button>
            {bet && <p className="g-bet-placed">Bet placed! You can change it before the race starts.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Race Phase ---------------------------------------------------------------

function RacePhase({ positions, bet, racers }) {
  const svgRef = useRef(null)

  const CX = 550, CY = 260, RX_BASE = 300, RY_BASE = 160
  const LANE_W = 18

  function getOvalPoint(progress, rx, ry) {
    const angle = (progress / 100) * Math.PI * 2 - Math.PI / 2
    return {
      x: CX + rx * Math.cos(angle),
      y: CY + ry * Math.sin(angle)
    }
  }

  useEffect(() => {
    if (!svgRef.current || !positions) return
    racers.forEach((r, i) => {
      const rx = RX_BASE - i * LANE_W * 0.85
      const ry = RY_BASE - i * LANE_W * 0.55
      const prog = positions[r.id] ?? 0
      const pt = getOvalPoint(prog, rx, ry)
      const g = svgRef.current.getElementById('dot-' + r.id)
      if (g) g.setAttribute('transform', `translate(${pt.x}, ${pt.y})`)
    })
  }, [positions])

  const trackPaths = racers.map((r, i) => {
    const rx = RX_BASE - i * LANE_W * 0.85
    const ry = RY_BASE - i * LANE_W * 0.55
    const pts = []
    for (let t = 0; t <= 100; t += 0.5) {
      const p = getOvalPoint(t, rx, ry)
      pts.push(`${t === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    }
    pts.push('Z')
    return { r, path: pts.join(' ') }
  })

  const dotPositions = racers.map((r, i) => {
    const rx = RX_BASE - i * LANE_W * 0.85
    const ry = RY_BASE - i * LANE_W * 0.55
    const prog = positions?.[r.id] ?? 0
    return { r, i, ...getOvalPoint(prog, rx, ry) }
  })

  return (
    <div className="g-race-layout">
      <h2 className="g-race-title">Race in progress!</h2>
      {bet && (
        <p className="g-bet-reminder">
          Rooting for <strong>{racers.find(r => r.id === bet.racerId)?.name}</strong>!
        </p>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 900 500"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto' }}
      >
        {trackPaths.map(({ r, path }) => (
          <path
            key={r.id}
            d={path}
            fill="none"
            stroke={r.color}
            strokeWidth="16"
            opacity="0.15"
          />
        ))}

        <line x1="550" y1="85" x2="550" y2="105" stroke="white" strokeWidth="2" opacity="0.6"/>
        <text x="550" y="78" fontSize="10" fill="white" opacity="0.5" textAnchor="middle">START</text>

        <text x="16" y="20" fontSize="12" fontWeight="500" fill="var(--color-text-secondary,#888)">Racers</text>
        {racers.map((r, i) => {
          const ly = 36 + i * 22
          const isMyPick = bet?.racerId === r.id
          return (
            <g key={r.id}>
              <circle cx="24" cy={ly} r="8" fill={r.color} stroke={isMyPick ? '#fff' : 'none'} strokeWidth="2"/>
              <text x="24" y={ly + 4} textAnchor="middle" fontSize="9" fontWeight="500" fill="#000">{i + 1}</text>
              <text x="38" y={ly + 4} fontSize="11" fill="var(--color-text-primary,#222)" fontWeight={isMyPick ? '500' : '400'}>
                {r.name}{isMyPick ? ' (your pick)' : ''}
              </text>
            </g>
          )
        })}

        {dotPositions.map(({ r, i, x, y }) => (
          <g
            key={r.id}
            id={'dot-' + r.id}
            style={{ transition: 'transform 0.15s linear' }}
            transform={`translate(${x}, ${y})`}
          >
            <circle
              r="12"
              fill={r.color}
              stroke={bet?.racerId === r.id ? '#fff' : 'rgba(0,0,0,0.3)'}
              strokeWidth={bet?.racerId === r.id ? 3 : 1}
            />
            <text
              id={'lbl-' + r.id}
              x="0" y="4"
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill="#000"
              style={{ pointerEvents: 'none' }}
            >{i + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// --- Results Phase ------------------------------------------------------------

function ResultsPhase({ winnerId, bet, odds, balance, racers }) {
  const winner   = racers.find(r => r.id === winnerId) ?? racers[0]
  const betRacer = bet ? racers.find(r => r.id === bet.racerId) : null
  const won      = bet?.racerId === winnerId
  const payout   = won ? calcPayout(bet.amount, odds?.[winnerId] ?? 1) : 0

  return (
    <div className="g-results-layout">
      <div className="g-winner-card" style={{ '--wc': winner.color }}>
        {winner.image && (
          <img src={winner.image} alt={winner.name} className="g-winner-img" />
        )}
        <div>
          <p className="g-winner-label">Winner</p>
          <h2 className="g-winner-name">{winner.name}</h2>
        </div>
      </div>

      {bet ? (
        <div className={`g-result-card ${won ? 'win' : 'loss'}`}>
          <p className="g-result-headline">{won ? 'You won! gg wp' : 'You lost lmao'}</p>
          <p className="g-result-amount" style={{ color: won ? '#2e7d32' : '#c62828' }}>
            {won ? `+${(payout - bet.amount).toLocaleString()}` : `-${bet.amount.toLocaleString()}`} coins
          </p>
          <p className="g-result-detail">
            {won
              ? `${bet.amount} × ${odds?.[bet.racerId]} = ${payout.toLocaleString()} returned`
              : `${betRacer?.name} didn't place first`}
          </p>
          <p className="g-result-balance">Balance: <strong>{balance.toLocaleString()}</strong> coins</p>
        </div>
      ) : (
        <div className="g-result-card no-bet">
          <p>You didn't bet this round.</p>
          <p className="g-result-balance">Balance: <strong>{balance.toLocaleString()}</strong> coins</p>
        </div>
      )}

      {balance <= 0 && <p className="g-broke">You're broke 💸</p>}
      <p className="g-next-hint">Next race starting soon...</p>
    </div>
  )
}

// --- Main ---------------------------------------------------------------------

export default function Gambling() {
  const { user, refreshMe } = useAuth()

  const [phase,     setPhase]     = useState(null)
  const [odds,      setOdds]      = useState({})
  const [timeLeft,  setTimeLeft]  = useState(BETTING_DURATION)
  const [positions, setPositions] = useState({})
  const [winnerId,  setWinnerId]  = useState(null)
  const [connected, setConnected] = useState(false)
  const [racers,    setRacers]    = useState([])

  const [balance, setBalance] = useState(null)
  const [bet,     setBet]     = useState(null)

  const betRef     = useRef(null)
  const oddsRef    = useRef(null)
  const phaseRef   = useRef(null)
  const balanceRef = useRef(null)

  // Load balance from user account when user loads
  useEffect(() => {
    if (user?.coins !== undefined) {
      setBalance(user.coins)
      balanceRef.current = user.coins
    } else if (user === null) {
      setBalance(STARTING_BALANCE)
      balanceRef.current = STARTING_BALANCE
    }
  }, [user])

  // Keep balanceRef in sync
  useEffect(() => {
    balanceRef.current = balance
  }, [balance])

  // Save coins to server
  async function saveCoins(newBalance) {
    if (!user) return
    await fetch(import.meta.env.VITE_GRAPHQL_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { updateCoins(coins: ${newBalance}) { coins } }`
      })
    })
    refreshMe()
  }

  useEffect(() => {
    const socket = io(SOCKET_URL)

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('race:state', state => {
      const prevPhase = phaseRef.current

      if (state.phase === 'results' && prevPhase === 'racing') {
        const currentBet  = betRef.current
        const currentOdds = oddsRef.current
        if (currentBet && currentOdds) {
          let newBalance
          if (currentBet.racerId === state.winnerId) {
            const p = calcPayout(currentBet.amount, currentOdds[state.winnerId])
            newBalance = balanceRef.current - currentBet.amount + p
          } else {
            newBalance = balanceRef.current - currentBet.amount
          }
          setBalance(newBalance)
          saveCoins(newBalance)
        }
      }

      if (state.phase === 'betting' && prevPhase === 'results') {
        setBet(null)
        betRef.current = null
        if (balanceRef.current <= 0) {
          setBalance(STARTING_BALANCE)
          saveCoins(STARTING_BALANCE)
        }
      }

      phaseRef.current = state.phase
      oddsRef.current  = state.odds
      setPhase(state.phase)
      setOdds(state.odds)
      setTimeLeft(state.timeLeft)
      setPositions(state.positions)
      setWinnerId(state.winnerId)
      if (state.racers?.length) setRacers(state.racers)
    })

    return () => socket.disconnect()
  }, [])

  function handlePlaceBet(racerId, amount) {
    const b = { racerId, amount }
    setBet(b)
    betRef.current = b
  }

  if (!connected || !phase || balance === null || racers.length === 0) {
    return (
      <>
        <Header title="STABLEMETRICS RACING" />
        <Nav links={NAV_LINKS} />
        <main className="g-main">
          <p style={{ textAlign: 'center', color: '#aaa', marginTop: '4rem' }}>
            Connecting to race server...
          </p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header title="STABLEMETRICS RACING" />
      <Nav links={NAV_LINKS} />
      <main className="g-main">
        {phase === 'betting' && (
          <BettingPhase
            timeLeft={timeLeft} odds={odds}
            balance={balance} bet={bet}
            onPlaceBet={handlePlaceBet}
            racers={racers}
          />
        )}
        {phase === 'racing' && (
          <RacePhase positions={positions} bet={bet} racers={racers} />
        )}
        {phase === 'results' && (
          <ResultsPhase
            winnerId={winnerId} bet={bet}
            odds={odds} balance={balance}
            racers={racers}
          />
        )}
      </main>
      <Footer />
    </>
  )
}