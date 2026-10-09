'use client'

import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { DiffTextarea } from '@/components/diff-textarea'
import { MAX_DIFF_LENGTH } from '@/lib/diff-limits'
import { samples } from '@/lib/samples'
import { cn } from '@/lib/utils'

type DiffInputProps = {
  onSubmit: (diff: string) => void
}

const sampleItems = samples.map((sample) => ({
  label: sample.name,
  value: sample.id,
}))

const formatCount = (count: number) => count.toLocaleString('en-US')

export const DiffInput = ({ onSubmit }: DiffInputProps) => {
  const [diff, setDiff] = useState('')
  const [sampleId, setSampleId] = useState<string | null>(null)
  const textareaId = useId()
  const hintId = useId()

  const isEmpty = diff.trim() === ''
  const overBy = diff.length - MAX_DIFF_LENGTH
  const isTooLong = overBy > 0

  const hint = isTooLong
    ? `The diff is too long. Remove ${formatCount(overBy)} ${overBy === 1 ? 'character' : 'characters'}.`
    : isEmpty
      ? 'Paste a diff or load a sample.'
      : null

  const handleSampleChange = (value: string | null) => {
    setSampleId(value)
    const sample = samples.find(({ id }) => id === value)
    if (sample) {
      setDiff(sample.diff)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isEmpty || isTooLong) {
      return
    }
    onSubmit(diff)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={textareaId} className="text-sm font-medium">
          Diff
        </label>
        <Select
          items={sampleItems}
          value={sampleId}
          onValueChange={handleSampleChange}
        >
          <SelectTrigger aria-label="Load sample" className="w-full sm:w-72">
            <SelectValue placeholder="Load sample" />
          </SelectTrigger>
          <SelectContent>
            {sampleItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DiffTextarea
        id={textareaId}
        value={diff}
        onChange={(event) => setDiff(event.target.value)}
        placeholder="diff --git a/src/app/page.tsx b/src/app/page.tsx"
        aria-invalid={isTooLong}
        aria-describedby={hint ? hintId : undefined}
        className="max-h-[60vh] min-h-64"
      />
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'space-y-1 text-sm text-muted-foreground',
            isTooLong && 'text-destructive'
          )}
        >
          <p className="tabular-nums">
            {formatCount(diff.length)} / {formatCount(MAX_DIFF_LENGTH)}
          </p>
          {hint && <p id={hintId}>{hint}</p>}
        </div>
        <Button type="submit" disabled={isEmpty || isTooLong}>
          Review
        </Button>
      </div>
    </form>
  )
}
