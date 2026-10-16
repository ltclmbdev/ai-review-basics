'use client'

import { useState } from 'react'

import { useCompletion } from '@ai-sdk/react'
import { toast } from 'sonner'

import { DiffInput } from '@/components/diff-input'
import { cn } from '@/lib/utils'

export const ReviewPanel = () => {
  const [isStopped, setIsStopped] = useState(false)
  const { completion, complete, error, isLoading, stop } = useCompletion({
    api: '/api/review',
    onError: () => toast.error('The review failed. Please try again.'),
  })

  const handleSubmit = (diff: string) => {
    setIsStopped(false)
    complete(diff)
  }

  const handleStop = () => {
    stop()
    setIsStopped(true)
  }

  const notice = isLoading
    ? null
    : error
      ? 'This review is incomplete because it failed partway. Run it again for the full review.'
      : isStopped
        ? 'Review stopped. The findings above may be incomplete.'
        : null

  return (
    <div className="space-y-8">
      <DiffInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={handleStop}
      />
      <section
        aria-label="Review results"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {completion === '' ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {isLoading ? 'Reviewing the diff…' : 'Findings will appear here.'}
          </p>
        ) : (
          <div className="space-y-2">
            <p className="rounded-lg border p-4 text-sm leading-6 whitespace-pre-wrap">
              {completion}
            </p>
            {notice && (
              <p
                className={cn(
                  'text-sm',
                  error ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {notice}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
