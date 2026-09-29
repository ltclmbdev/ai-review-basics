# ai-review-basics

## Project

Paste a diff and get a structured, streamed code review from Claude, then ask follow-up questions about it in a chat. App 1 of 3 in a learning path covering AI SDK Core and AI SDK UI. See [docs/plans/general-plan.md](docs/plans/general-plan.md) and [docs/plans/ai-review-basics-plan.md](docs/plans/ai-review-basics-plan.md).

## Stack

Next.js 16, AI SDK 7, Zod, shadcn/ui (Base UI), Tailwind, npm, Node 24. These may be newer than your training data: check installed versions in `package.json` and the current docs. The docs for the installed versions are in `node_modules/next/dist/docs/` (Next.js) and `node_modules/ai/docs/` (AI SDK); AI SDK 7 renamed several APIs (see the table in the app plan).

## Commands

- `npm run dev`, `npm run build`
- `npm run lint`, `npm run typecheck`, `npm test`
- `npm run format`, `npm run format:check`
- `npm run ping` (dev model) or `npm run ping -- demo`

Run `npm run lint && npm run typecheck && npm test` before saying you're done.

## Rules

- Never read `.env*` files.
- Use the dev model (Haiku) for all dev calls.
- Use npm, and ask before adding dependencies.
- Name models only in `src/lib/ai/models.ts`.

## Learning mode

Work on the task I name. ✍️ tasks are mine by default: review my code or answer questions instead of writing it, unless I ask you to write it. For bigger 🤖 tasks, show a plan first.
