'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { DiffInput } from '@/components/diff-input'
import { cn } from '@/lib/utils'

type ReviewResponse = {
  text?: string
  error?: string
}

export const ReviewPanel = () => {
  const [review, setReview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (diff: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ diff }),
      })
      const data: ReviewResponse = await response.json().catch(() => ({}))
      if (!response.ok || data.text === undefined) {
        toast.error(data.error ?? 'The review failed. Please try again.')
        return
      }
      setReview(data.text)
    } catch {
      toast.error('Could not reach the server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <DiffInput onSubmit={handleSubmit} isLoading={isLoading} />
      <section
        aria-label="Review results"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {review === null ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {isLoading ? 'Reviewing the diff…' : 'Findings will appear here.'}
          </p>
        ) : (
          <p
            className={cn(
              'rounded-lg border p-4 text-sm leading-6 whitespace-pre-wrap transition-opacity',
              isLoading && 'opacity-60'
            )}
          >
            {review}
          </p>
        )}
      </section>
    </div>
  )
}
