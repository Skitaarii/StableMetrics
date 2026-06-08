import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// --- Constants ----------------------------------------------------------------

const SOCKET_URL       = 'http://localhost:4000'
const STARTING_BALANCE = 1000
const BETTING_DURATION = 15
const QUICK_AMOUNTS    = [50, 100, 250, 500]

const RACERS = [
  { id: 'suzuka',  name: 'Silence Suzuka',  color: '#44fe2f', image: 'https://umamusume.com/_app/immutable/assets/gameplay_silencesuzuka.IU_hfHC5.png' },
  { id: 'special', name: 'Special Week',    color: '#ff52e8', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'tokai',   name: 'Tokai Teio',      color: '#66baff', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'mcqueen', name: 'Mejiro McQueen',  color: '#c9a8fc', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'rice',    name: 'Rice Shower',     color: '#924ece', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'ardan',   name: 'Mejiro Ardan',    color: '#67f1ef', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'creek',   name: 'Super Creek',     color: '#91e0ff', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'rudolf',  name: 'Symboli Rudolf',  color: '#209339', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'oguri',   name: 'Oguri Cap',       color: '#e4e4e4', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
]

const NAV_LINKS = [{ to: '/', label: 'Home page' }]

function calcPayout(amount, odds) { return Math.floor(amount * odds) }

// --- Betting Phase -----------------------------------------------------------

function BettingPhase({ timeLeft, odds, balance, bet, onPlaceBet }) {
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
            {RACERS.map(r => (
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
                <img src={r.image} alt={r.name} className="g-racer-img" />
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
                ? <>Betting <strong>{parsedAmt}</strong> on <strong>{RACERS.find(r => r.id === selected)?.name}</strong> → potential <strong>{calcPayout(parsedAmt, odds[selected] ?? 1).toLocaleString()}</strong></>
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

function RacePhase({ positions, bet }) {
  return (
    <div className="g-race-layout">
      <h2 className="g-race-title">Race in progress!</h2>
      {bet && (
        <p className="g-bet-reminder">
          Rooting for <strong>{RACERS.find(r => r.id === bet.racerId)?.name}</strong>!
        </p>
      )}
      <div className="g-track">
        {RACERS.map(r => (
          <div key={r.id} className={`g-lane ${bet?.racerId === r.id ? 'my-pick' : ''}`}>
            <span className="g-lane-label">{r.name}</span>
            <div className="g-lane-bar">
              <div
                className="g-lane-fill"
                style={{ width: `${positions?.[r.id] ?? 0}%`, background: r.color }}
              />
              <span
                className="g-lane-runner"
                style={{ left: `max(0px, calc(${positions?.[r.id] ?? 0}% - 22px))` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Results Phase ------------------------------------------------------------

function ResultsPhase({ winnerId, bet, odds, balance }) {
  const winner   = RACERS.find(r => r.id === winnerId) ?? RACERS[0]
  const betRacer = bet ? RACERS.find(r => r.id === bet.racerId) : null
  const won      = bet?.racerId === winnerId
  const payout   = won ? calcPayout(bet.amount, odds?.[winnerId] ?? 1) : 0

  return (
    <div className="g-results-layout">
      <div className="g-winner-card" style={{ '--wc': winner.color }}>
        <img src={winner.image ?? RACERS[0].image} alt={winner.name} className="g-winner-img" />
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
  const [phase,     setPhase]     = useState(null)
  const [odds,      setOdds]      = useState({})
  const [timeLeft,  setTimeLeft]  = useState(BETTING_DURATION)
  const [positions, setPositions] = useState({})
  const [winnerId,  setWinnerId]  = useState(null)
  const [connected, setConnected] = useState(false)

  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [bet,     setBet]     = useState(null)

  const betRef   = useRef(null)
  const oddsRef  = useRef(null)
  const phaseRef = useRef(null)

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
          if (currentBet.racerId === state.winnerId) {
            const p = calcPayout(currentBet.amount, currentOdds[state.winnerId])
            setBalance(b => b - currentBet.amount + p)
          } else {
            setBalance(b => b - currentBet.amount)
          }
        }
      }

      if (state.phase === 'betting' && prevPhase === 'results') {
        setBet(null)
        betRef.current = null
        setBalance(b => b <= 0 ? STARTING_BALANCE : b)
      }

      phaseRef.current = state.phase
      oddsRef.current  = state.odds
      setPhase(state.phase)
      setOdds(state.odds)
      setTimeLeft(state.timeLeft)
      setPositions(state.positions)
      setWinnerId(state.winnerId)
    })

    return () => socket.disconnect()
  }, [])

  function handlePlaceBet(racerId, amount) {
    const b = { racerId, amount }
    setBet(b)
    betRef.current = b
  }

  if (!connected || !phase) {
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
          />
        )}
        {phase === 'racing' && (
          <RacePhase positions={positions} bet={bet} />
        )}
        {phase === 'results' && (
          <ResultsPhase
            winnerId={winnerId} bet={bet}
            odds={odds} balance={balance}
          />
        )}
      </main>
      <Footer />
    </>
  )
}