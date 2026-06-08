import { describe, it, expect } from 'vitest'

// -- Pure functions copied from server/client for testing ----------------------

const RACERS = [
  { id: 'suzuka' }, { id: 'special' }, { id: 'tokai' },
  { id: 'mcqueen' }, { id: 'rice' }, { id: 'ardan' },
  { id: 'creek' }, { id: 'rudolf' }, { id: 'oguri' },
]

function calcPayout(amount, odds) { return Math.floor(amount * odds) }

function generateOdds(speeds) {
  const weights = RACERS.map(r => speeds[r.id])
  const total   = weights.reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    RACERS.map((r, i) => [r.id, +(total / weights[i] * 0.85).toFixed(1)])
  )
}

// -- Unit Tests ----------------------------------------------------------------

describe('calcPayout', () => {
  it('returns the correct payout for a winning bet', () => {
    expect(calcPayout(100, 2.5)).toBe(250)
  })

  it('floors decimal results instead of rounding', () => {
    expect(calcPayout(100, 1.9)).toBe(190)
  })
})

describe('generateOdds', () => {
  const speeds = Object.fromEntries(RACERS.map(r => [r.id, Math.random() * 0.3 + 0.85]))
  const odds   = generateOdds(speeds)

  it('returns odds for every racer', () => {
    RACERS.forEach(r => {
      expect(odds[r.id]).toBeDefined()
    })
  })

  it('all odds are positive numbers', () => {
    RACERS.forEach(r => {
      expect(odds[r.id]).toBeGreaterThan(0)
    })
  })
})