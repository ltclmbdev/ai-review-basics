# App 1 · ai-review-basics

> Status: **CONFIRMED** (2026-09-29)
> App 1 of 3 · Estimate: 2–2.5 weeks (about 18–22 hours) · Repo: `ai-review-basics`
> General plan: [general-plan.md](general-plan.md) · Next: App 2 · `ai-review-agent`

## Goal

Learn the AI SDK fundamentals by building one useful feature: paste a diff, get a structured review that streams in as cards, then ask follow-up questions about it in a chat.

By the end:

- `/review` streams a structured list of findings for a pasted diff,
- `/chat` runs the same review inside a chat, with findings as cards, markdown answers, stop/regenerate and follow-up questions,
- every response shows its token usage and cost.

## 1. Learning goals

- **The provider model.** A model is a value (`anthropic('claude-haiku-4-5')`); your code depends on the AI SDK, not on a vendor SDK.
- **Text generation vs streaming.** `generateText` vs `streamText`, what a stream is on the wire, and why streaming changes the UX.
- **Structured output.** `Output.object()` / `Output.array()` with a Zod schema; why partial streamed output isn't validated, and how `elementStream` gives you complete, validated elements.
- **Prompting for reviews.** System prompts, giving the model a role and a rubric, and iterating on a prompt against fixed sample inputs.
- **Token economics.** How `usage` turns into cost, and how Haiku and Sonnet differ in latency, cost and quality.
- **AI SDK UI.** `useCompletion`, `useObject` and `useChat`; UI messages vs model messages; message parts; custom data parts; message metadata.
- **Chat UX.** Status states (`submitted`, `streaming`, `ready`, `error`), stop, regenerate, error recovery and rendering streamed markdown.

## 2. Reading list (≈2 h)

**AI SDK**

- [Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [Foundations: Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models), [Prompts](https://ai-sdk.dev/docs/foundations/prompts) and [Streaming](https://ai-sdk.dev/docs/foundations/streaming)
- [Generating Text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text) and [Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [Prompt Engineering](https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering) and [Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [Completion](https://ai-sdk.dev/docs/ai-sdk-ui/completion) and [Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)
- [Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot), [Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data) and [Message Metadata](https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata)
- [Providers: Anthropic](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)

The same docs ship inside the package at `node_modules/ai/docs/`, matched to the installed version.

**AI SDK 7 renamed several APIs**, so older tutorials and blog posts (and Claude's memory) use the old names. Checked against `ai` 7.0.x:

| Older name | AI SDK 7 |
|---|---|
| `system: '…'` | `instructions: '…'` (the old name still works, with a deprecation warning) |
| `onFinish` | `onEnd` |
| `result.toUIMessageStreamResponse()` | `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })` |
| `result.toTextStreamResponse()` | `createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) })` |

The full list is in `node_modules/ai/docs/08-migration-guides/23-migration-guide-7-0.mdx`.

**Claude Platform**

- [Models overview](https://platform.claude.com/docs/en/models/overview) and [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)

## 3. Scope

**In scope**

- The common boilerplate (general plan, section 4)
- `/review`: pasted diff → streamed structured findings
- `/chat`: review chat with findings cards, markdown, stop/regenerate, follow-up questions, usage and cost per message
- A few sample diffs with seeded bugs, reused later by App 2's evals

**Out of scope** (App 2 and later)

- Tools, agents, GitHub PR URLs, RAG, evals
- Auth, saving reviews, deploying

### Target structure at the end

```
src/
├── app/
│   ├── page.tsx                  → home: links to /review and /chat
│   ├── review/page.tsx
│   ├── chat/page.tsx
│   └── api/
│       ├── review/route.ts
│       └── chat/route.ts
├── components/                   → FindingCard, DiffInput, chat components; ui/ for shadcn
└── lib/
    ├── ai/
    │   ├── models.ts
    │   ├── cost.ts (+ cost.test.ts)
    │   ├── prompts.ts            → system prompts
    │   └── finding.ts            → Finding schema and types
    └── samples/                  → sample diffs with seeded bugs
scripts/ping.ts
```

## 4. Tasks

Legend: ✍️ = you write it (Claude Code reviews or answers questions; if you ask it to write it, it does) · 🤖 = Claude Code writes it, you review.

### Stage 0 · Boilerplate (about 1 day) · branch `stage-0-boilerplate`

#### T0.1 — Set up the boilerplate (🤖, about 1 h)

Run the **boilerplate setup prompt** from section 4 of the general plan.

**Acceptance:** `npm run dev` shows the home page; `format:check`, `lint`, `typecheck`, `test` and `build` pass; versions are pinned; `CLAUDE.md` and `.claude/settings.json` exist.

#### T0.2 — Key, cost helper and first call (✍️, about 1.5 h)

1. Create `.env.local` from `.env.example` and paste your API key. Check it's ignored: `git check-ignore -v .env.local`.
2. ✍️ `src/lib/ai/cost.ts`: a price table (USD per million tokens) keyed by model ID, and `estimateCost(modelId, usage)` returning `{ inputTokens, outputTokens, usd }`. Decide what an unknown model ID should do. Unit-test it in `cost.test.ts`.
3. ✍️ `scripts/ping.ts`: call `generateText` with the dev model and the prompt "Reply with one sentence: what is a code review?", then print the text, `usage`, `finishReason`, the time it took and the estimated cost.
4. Run `npm run ping` (dev model), then `npm run ping -- demo`: read the optional argument from `process.argv`. Write down the difference in latency, cost and output.

**Acceptance:** `npm test` passes, and `npm run ping` prints a response, token counts and a cost of about $0.001 or less with Haiku.

#### T0.3 — Wrap up (✍️ + 🤖, about 30 min)

- 🤖 README stub: what the app is, the stack, and how to run it (`npm install`, `.env.local`, `npm run dev`, `npm run ping`).
- ✍️ Start `NOTES.md` with the Stage 0 note (section 7).
- Open a PR to `main`, check CI is green, merge.

### Stage 1 · AI SDK Core (about 1 week) · branch `stage-1-core`

#### T1.1 — Review page and sample diffs (🤖, about 1 h)

```text
We're on Stage 1, T1.1 of docs/plans/ai-review-basics-plan.md.
- Create 4 sample diffs in src/lib/samples/ (unified diff format, React/TypeScript/Next.js code, 30–150 lines each), exported with a name and the list of bugs seeded in them. Seed realistic bugs: a missing useEffect dependency, an unhandled promise rejection, dangerouslySetInnerHTML with user input, an off-by-one in pagination, a leaked secret in client code, and one clean diff with no real issues.
- Create /review: a DiffInput component (shadcn Textarea, a "Load sample" select filled from the samples, character count, Review button) and an empty results area. No AI calls yet; the button can log the diff.
- Reject empty input and input over 20,000 characters in the UI.
Show me the plan first.
```

**Acceptance:** `/review` renders, samples load into the textarea, and the limits work.

#### T1.2 — First review with `generateText` (✍️, about 1.5 h)

1. ✍️ `src/lib/ai/prompts.ts`: a system prompt for a senior React/TypeScript reviewer. Say what to look for (bugs, security, performance, readability), what to ignore and how to format the answer.
2. ✍️ `src/app/api/review/route.ts`: read `{ diff }` from the body, validate it (non-empty, max length), call `generateText` with the dev model and the system prompt as `instructions`, log `usage` and the estimated cost on the server, and return `{ text }`.
3. 🤖 Wire the Review button to the route and show the text result with a loading state and an error toast.

**Acceptance:** reviewing a sample returns a sensible review, and the server log shows tokens and cost.

#### T1.3 — Stream it with `streamText` (✍️, about 1 h)

1. ✍️ Switch the route to `streamText`. `useCompletion` posts `{ prompt }`, so read the diff from `prompt` instead of `diff`. Return `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`, which is what `useCompletion` expects.
2. ✍️ On the client, use `useCompletion` from `@ai-sdk/react` so the review appears as it's generated. 🤖 can do the markup around it.
3. Log usage and cost when the stream ends (the `onEnd` callback).

**Acceptance:** the review appears token by token, and stop works (`useCompletion` returns `stop`).

#### T1.4 — Structured findings (✍️, about 3 h)

1. ✍️ `src/lib/ai/finding.ts`: a Zod `findingSchema`. Suggested fields: `severity` (`critical` | `major` | `minor` | `nit`), `file`, `line` (optional), `title`, `explanation`, `suggestedFix` (optional). Use `.describe()` on fields; the descriptions go to the model. Export the `Finding` type with `z.infer`.
2. ✍️ First with `generateText` and `output: Output.array({ element: findingSchema })`: check the result is typed and validated, and what happens with the clean sample diff.
3. ✍️ Then stream it to the page. `useObject` parses a stream into **one object**, so wrap the array: `reviewSchema = z.object({ findings: z.array(findingSchema) })`. Call `streamText` with `output: Output.object({ schema: reviewSchema })`, return `createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) })`, and on the client call `useObject({ api: '/api/review', schema: reviewSchema })` so findings appear while they're generated. (`Output.array` + `elementStream` comes back in T2.2, where you control the stream yourself.)
4. 🤖 `FindingCard`: severity badge, file:line, title, explanation and suggested fix in a code block. Sort by severity once streaming finishes, and show a summary line ("2 critical, 1 minor").

Things to notice: partial objects in `useObject` are not validated, so any field (and the last finding) can be incomplete while streaming. Render defensively.

**Acceptance:** findings stream in as cards, the clean diff gets zero or only `nit` findings, and each seeded bug in the other samples is found by at least one finding (with Haiku, some misses are fine; note them).

#### T1.5 — Prompt iteration and model comparison (✍️, about 2 h)

1. Run all samples with Haiku (a temporary switch in the route between `modelIds.dev` and `modelIds.demo` is enough) and write down, per sample: seeded bugs found, false positives, tokens and cost.
2. Improve the prompt (a severity rubric, "don't report style issues Prettier would fix", examples) and run again.
3. Run all samples once with Sonnet and compare.
4. Put the results table in `NOTES.md`.

**Acceptance:** a before/after table in `NOTES.md` with at least one prompt change that measurably helped.

#### T1.6 — Wrap up Stage 1 (✍️, about 30 min)

Stage note in `NOTES.md`, PR, green CI, merge.

### Stage 2 · AI SDK UI (about 1 week) · branch `stage-2-chat`

#### T2.1 — Basic chat (✍️ route + 🤖 UI, about 2 h)

1. ✍️ `src/app/api/chat/route.ts`: read `{ messages }`, convert them with `convertToModelMessages`, call `streamText` with the review system prompt (`instructions`), and return `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`.
2. 🤖 UI prompt:

```text
We're on Stage 2, T2.1 of docs/plans/ai-review-basics-plan.md. The route in src/app/api/chat/route.ts is done.
Create /chat with useChat from @ai-sdk/react and DefaultChatTransport pointing at /api/chat:
- the first message is a diff (reuse DiffInput with samples); later messages are free text,
- render messages by iterating over message.parts (text parts only for now),
- use status for a loading state; a Stop button while submitted/streaming; a Regenerate button on the last assistant message; on error, show the error and a Retry button that calls regenerate,
- autoscroll, and a layout that works on mobile.
AI SDK 7 may be newer than you know: follow node_modules/ai/docs/04-ai-sdk-ui/02-chatbot.mdx. Show me the plan first.
```

**Acceptance:** you can paste a diff, get a streamed text review, stop it, regenerate it and ask a follow-up question.

#### T2.2 — Findings as cards inside the chat (✍️, about 3 h)

1. ✍️ Define a typed UI message, `ReviewUIMessage = UIMessage<Metadata, { finding: Finding }>`, so the chat can carry `data-finding` parts.
2. ✍️ In the route, for the first message (the diff), use `createUIMessageStream`: run `streamText` with `Output.array({ element: findingSchema })`, write each element from `elementStream` as a `data-finding` part, then merge a second `streamText` call for a short text summary into the same stream (`writer.merge(toUIMessageStream({ stream: summary.stream }))`). Detect the first message with `messages.length === 1`. Later messages stay plain text answers.
3. 🤖 Render `data-finding` parts with `FindingCard` and text parts as text.

**Acceptance:** findings appear one by one as cards in the chat, followed by a summary.

#### T2.3 — Follow-up questions that know the findings (✍️, about 1.5 h)

Data parts aren't sent to the model by default: `convertToModelMessages` drops them unless you pass a `convertDataPart` callback (it applies to assistant messages too). Then:

1. ✍️ Use `convertDataPart` to turn `data-finding` parts into short text, so questions like "why is finding 2 critical?" or "show me the fix for the XSS one" work.
2. ✍️ A follow-up system prompt: answer about this diff and these findings, and say so when a question is out of scope.

**Acceptance:** follow-up questions refer to specific findings correctly.

#### T2.4 — Markdown, code and usage (🤖 + ✍️, about 2 h)

1. 🤖 Render assistant text as markdown with syntax-highlighted code blocks that don't flicker while streaming. Claude Code should check the current options (for example `streamdown`) and ask before adding a dependency.
2. ✍️ Send usage as message metadata (the `messageMetadata` option of `toUIMessageStream`, returning `part.totalUsage` when `part.type === 'finish'`), then 🤖 show tokens and cost under each assistant message using `estimateCost`.

**Acceptance:** code in answers is highlighted, and each assistant message shows its tokens and cost.

#### T2.5 — Polish (🤖, about 1.5 h)

Empty state with sample diffs, skeletons while `submitted`, disabled inputs while busy, error toasts for rate limits and network errors, a "New review" button that clears the chat, and a home page linking `/review` and `/chat` with one-line descriptions.

**Acceptance:** nothing looks broken on a phone-width screen or when the API returns an error (test by temporarily using an invalid model ID).

#### T2.6 — Wrap up (✍️, about 1 h)

- Finish `NOTES.md` (section 7) and update the README with screenshots.
- PR, green CI, merge. **Milestone A reached.**

## 5. Definition of done

- [ ] `npm run dev`, `build`, `lint`, `typecheck`, `test` and `ping` pass; CI is green
- [ ] The API key is not in git (`git log -p | grep sk-ant` returns nothing)
- [ ] `/review` streams structured findings for a pasted diff
- [ ] `/chat` shows findings as cards, answers follow-up questions about them, and supports stop, regenerate and error retry
- [ ] Each response shows tokens and cost
- [ ] `estimateCost` is unit-tested
- [ ] The Haiku vs Sonnet and before/after prompt tables are in `NOTES.md`
- [ ] All stage PRs are merged

## 6. Cost notes

- A review of a 150-line diff is roughly 3–4k input and 1k output tokens: under $0.01 with Haiku, about $0.02 with Sonnet.
- Expected spend for the whole app: **under $1**, mostly from T1.5.
- Use Haiku for everything except the Sonnet runs in T0.2 and T1.5.

## 7. Learning note and interview talking points *(in `NOTES.md`)*

- What surprised me:
- `generateText` vs `streamText` vs structured output: when I'd use each:
- Prompt changes that made the biggest difference:
- Haiku vs Sonnet on the samples (quality, latency, cost):
- Talking points:
  - "Findings are schema-validated with Zod, so the UI renders typed data, not parsed text."
  - "I stream structured output element by element, so users see the first finding in about a second instead of waiting for the whole review."
  - "Every response carries its token usage and cost; I compared models on real samples before choosing one."
  - "The chat sends custom data parts to the UI and converts them back into context for follow-up questions."
