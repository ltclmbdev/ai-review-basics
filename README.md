# ai-review-basics

Paste a diff and get a structured, streamed code review from Claude, then ask follow-up questions about it in a chat.

App 1 of 3 in a learning path covering AI SDK Core and AI SDK UI. See [docs/plans/ai-review-basics-plan.md](docs/plans/ai-review-basics-plan.md) for the plan and progress.

## Stack

- Next.js 16 (App Router), TypeScript, React 19
- AI SDK 7 with the Anthropic provider (`ai`, `@ai-sdk/anthropic`) and Zod
- shadcn/ui (Base UI), Tailwind CSS
- Vitest, ESLint, Prettier
- Node 24, npm

## Getting started

Requires Node 24 (see `.nvmrc`) and an [Anthropic API key](https://platform.claude.com/settings/keys).

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY in .env.local
npm run dev                  # http://localhost:3000
```

Check that the key and model work with one real call:

```bash
npm run ping          # dev model (Haiku)
npm run ping -- demo  # demo model (Sonnet)
```

It prints the response, token usage, finish reason, latency and estimated cost.

## Scripts

| Script                            | What it does                          |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | Start the dev server                  |
| `npm run build` / `npm start`     | Production build and server           |
| `npm run lint`                    | ESLint                                |
| `npm run typecheck`               | Generate Next route types, then `tsc` |
| `npm test` / `npm run test:watch` | Vitest, once or in watch mode         |
| `npm run format` / `format:check` | Prettier                              |
| `npm run ping`                    | One model call with usage and cost    |

CI runs `format:check`, `lint`, `typecheck`, `test` and `build` on every push and pull request. It needs no API key.
