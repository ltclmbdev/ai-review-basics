import { describe, expect, it } from 'vitest'

import { estimateCost } from '@/lib/ai/cost'
import { modelIds } from '@/lib/ai/models'

describe('estimateCost', () => {
  it('prices a million input tokens on the dev model at $1', () => {
    const cost = estimateCost(modelIds.dev, {
      inputTokens: 1_000_000,
      outputTokens: 0,
    })

    expect(cost.usd).toBeCloseTo(1)
  })

  it('prices a typical review on the dev model', () => {
    const cost = estimateCost(modelIds.dev, {
      inputTokens: 3_000,
      outputTokens: 1_000,
    })

    expect(cost.usd).toBeCloseTo(0.008)
  })

  it('prices the same review on the demo model', () => {
    const cost = estimateCost(modelIds.demo, {
      inputTokens: 3_000,
      outputTokens: 1_000,
    })

    expect(cost.usd).toBeCloseTo(0.016)
  })

  it('passes token counts through', () => {
    const cost = estimateCost(modelIds.dev, {
      inputTokens: 1234,
      outputTokens: 56,
    })

    expect(cost.inputTokens).toBe(1234)
    expect(cost.outputTokens).toBe(56)
  })

  it('treats missing token counts as zero', () => {
    const cost = estimateCost(modelIds.dev, {
      inputTokens: undefined,
      outputTokens: undefined,
    })

    expect(cost).toEqual({ inputTokens: 0, outputTokens: 0, usd: 0 })
  })

  it('returns null cost for an unknown model', () => {
    const cost = estimateCost('unknown-model', {
      inputTokens: 100,
      outputTokens: 50,
    })

    expect(cost).toEqual({ inputTokens: 100, outputTokens: 50, usd: null })
  })

  it('does not treat inherited object keys as known models', () => {
    const cost = estimateCost('toString', {
      inputTokens: 100,
      outputTokens: 50,
    })

    expect(cost.usd).toBeNull()
  })
})
