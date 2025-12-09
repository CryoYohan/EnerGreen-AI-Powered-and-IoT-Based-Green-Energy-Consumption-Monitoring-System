import { describe, it, expect } from 'vitest'

// Mock function to test (in a real app, this would be imported from a service or utility)
function calculateCost(kwh, rate) {
  if (kwh < 0 || rate < 0) return 0
  return Number((kwh * rate).toFixed(2))
}

describe('Cost Calculator Logic', () => {
  it('correctly calculates cost for given kWh and rate', () => {
    expect(calculateCost(100, 12)).toBe(1200) // 100 kWh * 12 Pesos
    expect(calculateCost(50.5, 10)).toBe(505)
  })

  it('handles zero values', () => {
    expect(calculateCost(0, 10)).toBe(0)
    expect(calculateCost(100, 0)).toBe(0)
  })

  it('handles negative inputs gracefully by returning 0', () => {
    expect(calculateCost(-100, 10)).toBe(0)
    expect(calculateCost(100, -5)).toBe(0)
  })
})
