'use client'

import { DiffInput } from '@/components/diff-input'

export const ReviewPanel = () => {
  const handleSubmit = (diff: string) => {
    console.log('Review requested', diff)
  }

  return (
    <div className="space-y-8">
      <DiffInput onSubmit={handleSubmit} />
      <section
        aria-label="Review results"
        className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
      >
        Findings will appear here.
      </section>
    </div>
  )
}
