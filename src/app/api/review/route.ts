import { anthropic } from '@ai-sdk/anthropic'
import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai'

import { estimateCost } from '@/lib/ai/cost'
import { modelIds } from '@/lib/ai/models'
import { reviewSystemPrompt } from '@/lib/ai/prompts'
import { MAX_DIFF_LENGTH } from '@/lib/diff-limits'

const badRequest = (error: string) => Response.json({ error }, { status: 400 })

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null)
  const diff =
    typeof body === 'object' && body !== null && 'prompt' in body
      ? body.prompt
      : undefined

  if (typeof diff !== 'string') {
    return badRequest('Expected a JSON body with a "prompt" string.')
  }
  if (diff.trim() === '') {
    return badRequest('The diff is empty.')
  }
  if (diff.length > MAX_DIFF_LENGTH) {
    return badRequest(
      `The diff is longer than ${MAX_DIFF_LENGTH.toLocaleString('en-US')} characters.`
    )
  }

  const modelId = modelIds.dev

  const result = streamText({
    model: anthropic(modelId),
    instructions: reviewSystemPrompt,
    prompt: `<diff>\n${diff}\n</diff>`,
    abortSignal: request.signal,
    onEnd: ({ usage }) => {
      console.log('[api/review]', { modelId, ...estimateCost(modelId, usage) })
    },
    onAbort: () => {
      console.log('[api/review] aborted', { modelId })
    },
    onError: ({ error }) => {
      console.error('[api/review]', error)
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
