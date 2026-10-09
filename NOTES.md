# Notes

Learning notes and interview talking points for `ai-review-basics`. One section per stage; the structure follows section 7 of [the app plan](docs/plans/ai-review-basics-plan.md).

## Stage 0 · Boilerplate

### What I built

- Next.js 16 + AI SDK 7 + shadcn/ui boilerplate with Prettier, Vitest, CI and pinned versions (T0.1).
- `src/lib/ai/cost.ts`: a price table keyed by the IDs in `models.ts` and `estimateCost(modelId, usage)`, unit-tested in `cost.test.ts`.
- `scripts/ping.ts` (`npm run ping`): one `generateText` call that prints the text, usage, finish reason, latency and cost. `npm run ping -- demo` switches to the demo model.

### Decisions

- **Unknown model → `usd: null`, not an exception.** Cost is calculated after a model call has already succeeded, so a missing price shouldn't turn a working response into an error. The UI can show "—" instead.
- **`estimateCost` takes `Pick<LanguageModelUsage, 'inputTokens' | 'outputTokens'>`** instead of the full SDK type: it only reads those two fields, tests can pass a small object, and `result.usage` still fits.
- **The price table uses `satisfies Record<ModelId, ModelPrice>`**, with `ModelId` derived from `modelIds`. Adding a model to `models.ts` without a price is a type error.
- **`Object.hasOwn` instead of `in`** for the known-model check. `in` also matches inherited keys, so `'toString'` would count as a model; there's a test for it.
- **Cache tokens are ignored for now.** App 1 doesn't use prompt caching, so `inputTokens` is billed at the normal input price.

### What surprised me

- **AI SDK 7 changed what `usage` means.** `result.usage` is now the total across all steps, and `totalUsage` is deprecated. Older tutorials (and AI assistants) still describe the v6 meaning.
- **Every token count can be `undefined`.** Haiku returned `textTokens: undefined` in `outputTokenDetails`; Sonnet returned `73`. Any code that does arithmetic on usage has to handle missing values.
- **The same prompt costs a different number of input tokens per model**: 18 with Haiku, 21 with Sonnet. Token counts depend on the model's tokenizer, so cost comparisons need real runs, not estimates.
- **Top-level `await` fails in `scripts/ping.ts`.** `package.json` has no `"type": "module"`, so `tsx` runs `.ts` files as CommonJS. The fix is an async `main()` with `.catch()` (or an `.mts` file, like `vitest.config.mts`).
- **`tsc --noEmit` alone fails on a fresh checkout** because Next.js route types (`PageProps`, `LayoutProps`) don't exist yet. `typecheck` runs `next typegen` first.

### Haiku vs Sonnet on `npm run ping`

Prompt: "Reply with one sentence: what is a code review?" One run each, so latency is only a rough signal.

| Model           | Input tokens | Output tokens | Latency |      Cost | Output                                                                     |
| --------------- | -----------: | ------------: | ------: | --------: | -------------------------------------------------------------------------- |
| Haiku 4.5 (dev) |           18 |            37 | 1272 ms | $0.000203 | One correct sentence, the essentials                                       |
| Sonnet 5 (demo) |           21 |            73 | 1807 ms | $0.000772 | Longer and more complete (adds knowledge sharing, "other than the author") |

Sonnet cost about 3.8× more here: twice the price per token, and it wrote about twice as many output tokens for the same instruction. For a one-sentence answer, Haiku is good enough; the real comparison comes in T1.5 on the sample diffs.

### Talking points

- "Every model call reports its token usage and an estimated cost; the price table is type-checked against the list of models, so a new model can't ship without a price."
- "I measured Haiku and Sonnet on the same prompt before choosing a default: Sonnet was about 4× the cost for a one-sentence answer, mostly because it writes more."
- "The app depends on the AI SDK, not a vendor SDK: the model is a value (`anthropic(modelId)`), and model IDs live in one file."
