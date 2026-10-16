'use client'

import { useLayoutEffect, useRef } from 'react'

import { Textarea } from '@/components/ui/textarea'

import { cn } from '@/lib/utils'

type DiffTextareaProps = Omit<React.ComponentProps<'textarea'>, 'value'> & {
  value: string
}

const lineClassName = (line: string) => {
  if (
    line.startsWith('diff --git') ||
    line.startsWith('index ') ||
    line.startsWith('new file mode') ||
    line.startsWith('deleted file mode')
  ) {
    return 'font-semibold text-muted-foreground'
  }
  if (line.startsWith('+++') || line.startsWith('---')) {
    return 'font-semibold'
  }
  if (line.startsWith('@@')) {
    return 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
  }
  if (line.startsWith('+')) {
    return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
  }
  if (line.startsWith('-')) {
    return 'bg-red-500/15 text-red-800 dark:text-red-300'
  }
  return undefined
}

const sharedClassName =
  'm-0 border px-2.5 py-2 font-mono text-xs leading-5 whitespace-pre md:text-xs'

export const DiffTextarea = ({
  value,
  className,
  onScroll,
  ...props
}: DiffTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  // Translate instead of setting scrollLeft/scrollTop on the <pre>: the
  // textarea's scrollbars shrink its viewport, so the <pre> would clamp to a
  // smaller max scroll and drift out of line at the far edges.
  const syncScroll = () => {
    const textarea = textareaRef.current
    const lines = linesRef.current
    if (textarea && lines) {
      lines.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`
    }
  }

  useLayoutEffect(syncScroll, [value])

  return (
    <div className="relative grid">
      <pre
        aria-hidden
        className={cn(
          sharedClassName,
          'pointer-events-none absolute inset-0 overflow-hidden rounded-lg border-transparent'
        )}
      >
        <div ref={linesRef} className="w-max min-w-full">
          {value.split('\n').map((line, index) => (
            <div key={index} className={lineClassName(line)}>
              {line || ' '}
            </div>
          ))}
        </div>
      </pre>
      <Textarea
        ref={textareaRef}
        value={value}
        wrap="off"
        spellCheck={false}
        onScroll={(event) => {
          syncScroll()
          onScroll?.(event)
        }}
        className={cn(
          sharedClassName,
          'relative bg-transparent text-transparent caret-foreground selection:bg-primary/25 selection:text-transparent dark:bg-transparent',
          className
        )}
        {...props}
      />
    </div>
  )
}
