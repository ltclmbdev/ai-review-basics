import { describe, expect, it } from 'vitest'

import { MAX_DIFF_LENGTH } from '@/lib/diff-limits'
import { samples } from '@/lib/samples'

describe('samples', () => {
  it('have unique ids', () => {
    const ids = samples.map((sample) => sample.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('include exactly one clean diff', () => {
    const clean = samples.filter((sample) => sample.seededBugs.length === 0)

    expect(clean).toHaveLength(1)
  })

  it.each(samples)('$id is a unified diff of 30–150 lines', ({ diff }) => {
    const lineCount = diff.trimEnd().split('\n').length

    expect(diff.startsWith('diff --git ')).toBe(true)
    expect(diff).toMatch(/^@@ -\d+(,\d+)? \+\d+(,\d+)? @@/m)
    expect(lineCount).toBeGreaterThanOrEqual(30)
    expect(lineCount).toBeLessThanOrEqual(150)
  })

  it.each(samples)('$id fits the diff length limit', ({ diff }) => {
    expect(diff.length).toBeLessThanOrEqual(MAX_DIFF_LENGTH)
  })
})
