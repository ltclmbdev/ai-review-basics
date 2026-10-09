import type { LanguageModelUsage } from 'ai'

import { modelIds } from './models'

type ModelId = (typeof modelIds)[keyof typeof modelIds]

type ModelPrice = {
  inputPerMTok: number
  outputPerMTok: number
}

export type CostEstimate = {
  inputTokens: number
  outputTokens: number
  usd: number | null
}

const prices = {
  [modelIds.dev]: { inputPerMTok: 1, outputPerMTok: 5 },
  [modelIds.demo]: { inputPerMTok: 2, outputPerMTok: 10 },
} satisfies Record<ModelId, ModelPrice>

const isKnownModel = (modelId: string): modelId is ModelId =>
  Object.hasOwn(prices, modelId)

export const estimateCost = (
  modelId: string,
  usage: Pick<LanguageModelUsage, 'inputTokens' | 'outputTokens'>
): CostEstimate => {
  const inputTokens = usage.inputTokens ?? 0
  const outputTokens = usage.outputTokens ?? 0

  if (!isKnownModel(modelId)) {
    return { inputTokens, outputTokens, usd: null }
  }

  const price = prices[modelId]
  const usd =
    (inputTokens * price.inputPerMTok + outputTokens * price.outputPerMTok) /
    1_000_000

  return { inputTokens, outputTokens, usd }
}
