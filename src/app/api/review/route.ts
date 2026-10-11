import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

import { estimateCost } from '@/lib/ai/cost'
import { modelIds } from '@/lib/ai/models'
import { reviewSystemPrompt } from '@/lib/ai/prompts'
import { MAX_DIFF_LENGTH } from '@/lib/diff-limits'

const badRequest = (error: string) => Response.json({ error }, { status: 400 })

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null)
  const diff =
    typeof body === 'object' && body !== null && 'diff' in body
      ? body.diff
      : undefined

  if (typeof diff !== 'string') {
    return badRequest('Expected a JSON body with a "diff" string.')
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

  try {
    const { text, usage } = await generateText({
      model: anthropic(modelId),
      instructions: reviewSystemPrompt,
      prompt: `<diff>\n${diff}\n</diff>`,
    })

    console.log('[api/review]', { modelId, ...estimateCost(modelId, usage) })

    return Response.json({ text })
  } catch (error) {
    console.error('[api/review]', error)

    return Response.json(
      { error: 'The review failed. Please try again.' },
      { status: 500 }
    )
  }
}
