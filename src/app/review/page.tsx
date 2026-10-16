import type { Metadata } from 'next'

import { ReviewPanel } from '@/components/review-panel'

export const metadata: Metadata = {
  title: 'Review · AI Review Basics',
}

const ReviewPage = () => (
  <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:py-12">
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Review a diff</h1>
      <p className="text-sm text-muted-foreground">
        Paste a unified diff or load a sample, then run the review.
      </p>
    </div>
    <ReviewPanel />
  </main>
)

export default ReviewPage
