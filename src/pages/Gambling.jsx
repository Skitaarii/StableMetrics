import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'


const STARTING_BALANCE = 1000
const BETTING_DURATION = 15
const RACE_DURATION    = 8000
const TICK_MS          = 100

const RACERS = [
  { id: 'suzuka',  name: 'Silence Suzuka', color: '#44fe2f', image: 'https://umamusume.com/_app/immutable/assets/gameplay_silencesuzuka.IU_hfHC5.png' },
  { id: 'special', name: 'Special Week',   color: '#ff52e8', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'tokai',   name: 'Tokai Teio',     color: '#66baff', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'mcqueen', name: 'Mejiro McQueen', color: '#c9a8fc', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'rice',    name: 'Rice Shower',    color: '#924ece', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'ardan',    name: 'Mejiro Ardan',    color: '#67f1ef', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'creek',    name: 'Super Creek',    color: '#91e0ff', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'rudolf',    name: 'Symboli Rudolf',    color: '#209339', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
  { id: 'oguri',    name: 'Oguri Cap',    color: '#e4e4e4', image: 'https://umamusume.com/_app/immutable/assets/gameplay_specialweek.CtMZrUlS.png' },
]

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/characters', label: 'Characters' },
]

const QUICK_AMOUNTS = [50, 100, 250, 500]





function generateOdds(racers) {
  const weights = racers.map(() => Math.random() * 8 + 1)
  const total   = weights.reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    racers.map((r, i) => [r.id, +(total / weights[i]).toFixed(1)])
  )
}

function calcPayout(bet, odds) {
  return Math.floor(bet * odds)
}

function simulateRace(racers, ticks) {
  const speeds = Object.fromEntries(
    racers.map(r => [r.id, Math.random() * 0.4 + 0.8])
  )

  const snapshots = []
  const positions = Object.fromEntries(racers.map(r => [r.id, 0]))
  const finishTick = {}

  for (let t = 0; t < ticks; t++) {
    racers.forEach(r => {
      if (finishTick[r.id] !== undefined) return

      const surge = Math.random() < 0.1 ? Math.random() * 3 : 0
      positions[r.id] += speeds[r.id] * (Math.random() * 1.5 + 0.5) + surge

      if (positions[r.id] >= 100) {
        finishTick[r.id] = t
        positions[r.id] = 100
      }
    })

    snapshots.push({ ...positions })
  }

  const winner = racers
    .filter(r => finishTick[r.id] !== undefined)
    .sort((a, b) => finishTick[a.id] - finishTick[b.id])[0]

  return { snapshots, winnerId: winner?.id ?? racers[0].id }
}

// betting

function BettingPhase({ racers, odds, balance, onPlaceBet, timeLeft, existingBet }) {
  const [selected, setSelected] = useState(existingBet?.racerId ?? null)
  const [amount,   setAmount]   = useState(existingBet ? String(existingBet.amount) : '')

  const timerPct   = (timeLeft / BETTING_DURATION) * 100
  const timerColor = timeLeft <= 5 ? '#ff6b6b' : timeLeft <= 10 ? '#ffd166' : '#ff7eb9'
  const parsedAmt  = parseInt(amount, 10)
  const canBet     = selected && parsedAmt > 0 && parsedAmt <= balance

  function handleSubmit() {
    if (!canBet) return
    onPlaceBet(selected, parsedAmt)
  }

  return (
    <div className="g-betting-layout">

      {/*Top bar*/}
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

      {/*Main two-column layout*/}
      <div className="g-columns">

        {/* Left: racer list */}
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
                <img src={r.image} alt={r.name} className="g-racer-img" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: bet panel */}
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
                >
                  {v}
                </button>
              ))}
              <button
                className={`g-quick-btn all-in ${parsedAmt === balance ? 'active' : ''}`}
                onClick={() => setAmount(String(balance))}>
                ALL IN
              </button>
            </div>
            <input
              type="number"
              className="g-custom-input"
              placeholder="Custom amount..."
              min={1}
              max={balance}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="g-current-bet">
              {selected && parsedAmt > 0
                ? <>Betting <strong>{parsedAmt}</strong> on <strong>{racers.find(r=>r.id===selected)?.name}</strong> → potential <strong>{calcPayout(parsedAmt, odds[selected]??1).toLocaleString()}</strong></>
                : <span className="g-bet-placeholder">{selected ? 'Enter an amount' : 'Select a racer first'}</span>
              }
            </div>
            <button className="g-place-btn" onClick={handleSubmit} disabled={!canBet}>
              {existingBet ? 'Update bet' : 'Place bet'}
            </button>
            {existingBet && (
              <p className="g-bet-placed">
                Bet placed! You can change it before the race starts.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// racing

function RacePhase({ racers, positions, bet }) {
  return (
    <div className="g-race-layout">
      <h2 className="g-race-title">Race in progress!</h2>
      {bet && (
        <p className="g-bet-reminder">
          Rooting for <strong>{racers.find(r => r.id === bet.racerId)?.name}</strong>
        </p>
      )}
      <div className="g-track">
        {racers.map(r => (
          <div key={r.id} className={`g-lane ${bet?.racerId === r.id ? 'my-pick' : ''}`}>
            <span className="g-lane-label">{r.name}</span>
            <div className="g-lane-bar">
              <div
                className="g-lane-fill"
                style={{ width: `${positions[r.id] ?? 0}%`, background: r.color }}
              />
              <span className="g-lane-runner" style={{ left: `max(0px, calc(${positions[r.id] ?? 0}% - 22px))` }}>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// results

function ResultsPhase({ racers, winnerId, bet, payout, balance, odds, onNextRace }) {
  const winner = racers.find(r => r.id === winnerId) ?? racers[0]
  const betRacer = bet ? racers.find(r => r.id === bet.racerId) : null
  const won      = bet?.racerId === winnerId

  return (
    <div className="g-results-layout">
      <div className="g-winner-card" style={{ '--wc': winner.color }}>
        <img src={winner.image} alt={winner.name} className="g-winner-img" />
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
              ? `${bet.amount} × ${odds[bet.racerId]} = ${payout.toLocaleString()} returned`
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

      {balance <= 0 && <p className="g-broke">You're broke</p>}

      <button className="g-next-btn" onClick={onNextRace}>
        {balance <= 0 ? 'Start over' : 'Next race'}
      </button>
    </div>
  )
}



// main

export default function Gambling() {
  const TICKS = Math.floor(RACE_DURATION / TICK_MS)

  const [phase,     setPhase]     = useState('betting')
  const [balance,   setBalance]   = useState(STARTING_BALANCE)
  const [odds,      setOdds]      = useState(() => generateOdds(RACERS))
  const [timeLeft,  setTimeLeft]  = useState(BETTING_DURATION)
  const [bet,       setBet]       = useState(null)
  const [positions, setPositions] = useState(Object.fromEntries(RACERS.map(r => [r.id, 0])))
  const [winnerId,  setWinnerId]  = useState(null)
  const [payout,    setPayout]    = useState(0)

  const raceData = useRef(null)
  const tickRef  = useRef(0)
  const betRef   = useRef(null)

  useEffect(() => {
    if (phase !== 'betting') return
    if (timeLeft <= 0) { startRace(); return }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  useEffect(() => {
    if (phase !== 'racing') return
    tickRef.current = 0
    const interval = setInterval(() => {
      tickRef.current++
      const snap = raceData.current.snapshots[tickRef.current - 1]
      if (snap) setPositions({ ...snap })
      if (tickRef.current >= TICKS) {
        clearInterval(interval)
        finishRace(raceData.current.winnerId, betRef.current)
      }
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [phase])

  function startRace() {
    const result = simulateRace(RACERS, TICKS)
    raceData.current = result
    setPositions(Object.fromEntries(RACERS.map(r => [r.id, 0])))
    setPhase('racing')
  }

  function finishRace(wId, currentBet) {
    setWinnerId(wId)
    if (currentBet) {
      if (currentBet.racerId === wId) {
        const p = calcPayout(currentBet.amount, odds[wId])
        setPayout(p)
        setBalance(b => b - currentBet.amount + p)
      } else {
        setBalance(b => b - currentBet.amount)
      }
    }
    setPhase('results')
  }


  function handleNextRace() {
    setBet(null)
    betRef.current = null
    setPayout(0)
    setWinnerId(null)
    setOdds(generateOdds(RACERS))
    setTimeLeft(BETTING_DURATION)
    setPositions(Object.fromEntries(RACERS.map(r => [r.id, 0])))
    if (balance <= 0) setBalance(STARTING_BALANCE)
    setPhase('betting')
  }

  return (
    <>
      <Header title="STABLEMETRICS RACING" />
      <nav aria-label="navigation-principale">
        <ul>
          {NAV_LINKS.map(l => (
            <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
          ))}
        </ul>
      </nav>
      <main className="g-main">
        {phase === 'betting' && (
          <BettingPhase
            racers={RACERS} odds={odds} balance={balance}
            onPlaceBet={(id, amt) => { const b = { racerId: id, amount: amt }; setBet(b); betRef.current = b; }}
            timeLeft={timeLeft} existingBet={bet}
          />
        )}
        {phase === 'racing' && (
          <RacePhase racers={RACERS} positions={positions} bet={bet} />
        )}
        {phase === 'results' && (
          <ResultsPhase
            racers={RACERS} winnerId={winnerId} bet={bet}
            payout={payout} balance={balance} odds={odds}
            onNextRace={handleNextRace}
          />
        )}
      </main>
      <Footer />
    </>
  )
}
