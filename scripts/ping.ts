import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

import { estimateCost } from '@/lib/ai/cost'
import { modelIds } from '@/lib/ai/models'

type ModelKey = keyof typeof modelIds

const isModelKey = (value: string): value is ModelKey =>
  Object.hasOwn(modelIds, value)

const main = async () => {
  const arg = process.argv[2] ?? 'dev'

  if (!isModelKey(arg)) {
    throw new Error(
      `Unknown model "${arg}". Use one of: ${Object.keys(modelIds).join(', ')}`
    )
  }

  const modelId = modelIds[arg]
  const start = performance.now()

  const { text, usage, finishReason } = await generateText({
    model: anthropic(modelId),
    prompt: 'Reply with one sentence: what is a code review?',
  })

  const elapsedMs = performance.now() - start
  const cost = estimateCost(modelId, usage)

  console.log(`Model:         ${arg} (${modelId})`)
  console.log(`Text:          ${text}`)
  console.log(`Finish reason: ${finishReason}`)
  console.log(`Time:          ${Math.round(elapsedMs)} ms`)
  console.log(
    `Tokens:        ${cost.inputTokens} in / ${cost.outputTokens} out`
  )
  console.log(`Cost:          $${cost.usd?.toFixed(6) ?? 'unknown'}`)
  console.log('Usage:', usage)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
