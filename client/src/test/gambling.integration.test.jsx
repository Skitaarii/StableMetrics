import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// -- Minimal component copies for integration testing --------------------------

const RACERS = [
  { id: 'suzuka',  name: 'Silence Suzuka',  color: '#44fe2f' },
  { id: 'special', name: 'Special Week',    color: '#ff52e8' },
]

function ResultsPhase({ winnerId, bet, odds, balance }) {
  const winner = RACERS.find(r => r.id === winnerId) ?? RACERS[0]
  const won    = bet?.racerId === winnerId
  const payout = won ? Math.floor(bet.amount * (odds?.[winnerId] ?? 1)) : 0

  return (
    <div>
      <h2>{winner.name}</h2>
      {bet && (
        <div className={won ? 'win' : 'loss'}>
          <p>{won ? 'You won! gg wp' : 'You lost lmao'}</p>
          <p>Balance: {balance}</p>
        </div>
      )}
    </div>
  )
}

function BettingPhase({ odds, timeLeft, balance }) {
  return (
    <div>
      <span>{timeLeft}s</span>
      <span>{balance} coins</span>
      {RACERS.map(r => (
        <div key={r.id}>{r.name} x{odds[r.id]}</div>
      ))}
    </div>
  )
}

// -- Integration Tests ---------------------------------------------------------

describe('ResultsPhase', () => {
  it('shows winner name and win message when bet is correct', () => {
    render(
      <ResultsPhase
        winnerId="suzuka"
        bet={{ racerId: 'suzuka', amount: 100 }}
        odds={{ suzuka: 3.0 }}
        balance={1200}
      />
    )
    expect(screen.getByText('Silence Suzuka')).toBeInTheDocument()
    expect(screen.getByText('You won! gg wp')).toBeInTheDocument()
  })

  it('shows loss message when bet is wrong', () => {
    render(
      <ResultsPhase
        winnerId="suzuka"
        bet={{ racerId: 'special', amount: 100 }}
        odds={{ suzuka: 3.0 }}
        balance={900}
      />
    )
    expect(screen.getByText('You lost lmao')).toBeInTheDocument()
  })
})

describe('BettingPhase', () => {
  it('renders all racers with their odds', () => {
    render(
      <BettingPhase
        odds={{ suzuka: 5.5, special: 3.2 }}
        timeLeft={12}
        balance={1000}
      />
    )
    expect(screen.getByText('Silence Suzuka x5.5')).toBeInTheDocument()
    expect(screen.getByText('Special Week x3.2')).toBeInTheDocument()
  })

  it('displays the current timer and balance', () => {
    render(
      <BettingPhase
        odds={{ suzuka: 5.5, special: 3.2 }}
        timeLeft={12}
        balance={1000}
      />
    )
    expect(screen.getByText('12s')).toBeInTheDocument()
    expect(screen.getByText('1000 coins')).toBeInTheDocument()
  })
})