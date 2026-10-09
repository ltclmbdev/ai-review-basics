# Full-Stack AI Engineer — General Plan

> Status: **CONFIRMED v2** (2026-09-29): replaces the one-repo/eight-modules plan with three separate apps built on a common boilerplate
> Owner: Yevhen · Implementation tool: Claude Code

## 1. Goal

Become a senior frontend engineer who can own a product's AI features end to end: streaming UIs, tool calling and agents, RAG, evals and guardrails, auth and data. The aim is a stronger position in the remote EU/US market.

**Final outcome:** a deployed, public portfolio product called **AI Code Review Assistant**, two smaller learning apps that show how it was built, a case study and updated CV/Upwork/LinkedIn profiles.

## 2. Core principles

1. **One app, one repo.** Each app is a plain Next.js project with no module folders, no shared packages and no custom lint rules. Code is organised the way a normal small Next.js app is.
2. **Every app starts from the same boilerplate** (section 4), set up with one Claude Code prompt in under an hour. After that, each app adds only what it needs.
3. **The focus is AI, not tooling.** Setup stays at the defaults whenever the default is good enough. If a piece of tooling needs explaining, it probably doesn't belong in the boilerplate.
4. **You write the AI core, Claude Code does the rest.** Tasks marked ✍️ are yours: prompts, schemas, tools, the agent loop, retrieval and eval logic. Tasks marked 🤖 go to Claude Code: scaffolding, UI, tests and refactoring. If you ask Claude Code to write a ✍️ part, it just does it.
5. **Watch costs from day one.** Use Haiku 4.5 for development and Sonnet 5 only for demos and eval comparisons. The spend limit in the Claude Console is the safety net.
6. **Each app plan is a series of Claude Code tasks.** Every task has a ready-to-paste prompt (or says what you write by hand) and acceptance criteria.

## 3. The three apps

| # | App (repo name) | Covers | What it is | Est. |
|---|---|---|---|---|
| 1 | **`ai-review-basics`** | AI SDK Core + AI SDK UI | Paste a diff and get a structured, streamed review, then chat about it | 2–2.5 weeks |
| 2 | **`ai-review-agent`** | Tool calling and agents, RAG, evals and guardrails (+ Generative UI, optional) | An agent that reviews a diff or a GitHub PR with static-check tools and a best-practices knowledge base, measured by an eval suite | 5–6 weeks |
| 3 | **`ai-code-review-assistant`** | Supabase, shipping and showcase | The portfolio product: App 2's agent plus auth, saved reviews, pgvector, rate limits and a public deploy | 3–3.5 weeks |

**Total: about 10–12 weeks** at 8–10 hours a week.

- **App 1** starts from the boilerplate.
- **App 2** starts from a fresh boilerplate. The agent is new code, so App 1's code isn't needed. App 1's `Finding` schema, prompt and sample diffs are copied over when needed.
- **App 3** starts as a copy of App 2, because the product is that agent plus auth and data.

### App 1 · `ai-review-basics`

The AI SDK fundamentals on a simple, useful feature.

| Stage | What it adds |
|---|---|
| 0 · Boilerplate | Section 4, plus the first real call (`npm run ping`) with token usage and cost |
| 1 · AI SDK Core | `generateText` → `streamText` → structured review with `Output` and a Zod `Finding` schema (severity, file/line, explanation, suggested fix); server-side review of a pasted diff |
| 2 · AI SDK UI | `useChat` review chat, streamed findings rendered as cards, stop/regenerate, loading and error states, markdown and code rendering, follow-up questions about the review |

✍️ yours: the system prompt, the `Finding` schema, the route handler's model call, and choosing what to stream and how.

**Milestone A:** a working streaming review UI. Good enough for an early demo.

### App 2 · `ai-review-agent`

The technical core: an agent that uses tools and knowledge, and a way to measure it.

| Stage | What it adds |
|---|---|
| 0 · Boilerplate | Section 4 |
| 1 · Tools and agents | Tools (`parseDiff`, `runEslint`, `runTsc`, `fetchPrFiles`) with Zod-validated arguments, a multi-step loop with `stopWhen`, a tool-call timeline in the UI, GitHub PR URL input |
| 2 · RAG | A best-practices knowledge base (React/Next docs excerpts and your own rules), chunking and embeddings, a local vector store, vector search as a `searchDocs` tool, cited sources in findings |
| 3 · Evals and guardrails | A dataset of 20–30 diffs with seeded bugs; scorers (precision/recall on findings, LLM-as-judge for explanation quality); comparisons with and without RAG and between Haiku and Sonnet; token/cost tracking per run; prompt-injection defence (malicious comments inside diffs) |
| 4 · Generative UI *(optional)* | Rich components rendered from tool results (a diff viewer with inline comments, a severity summary) using message parts |

✍️ yours: the tool definitions and their `execute` functions, the agent loop settings, chunking and retrieval, the eval scorers and the injection defence.

**Milestone B:** an agent with tools, RAG and measured quality. This is the technical core of the portfolio.

### App 3 · `ai-code-review-assistant`

The product people will actually see.

| Stage | What it adds |
|---|---|
| 0 · Start | Copy of App 2 with a clean history and a new repo |
| 1 · Supabase | `@supabase/ssr`, email/password and GitHub OAuth, route protection in `proxy.ts` (the Next.js 16 name for middleware), Server Actions to save and list reviews, RLS policies, the vector store moved to pgvector |
| 2 · Ship | Rate limits per user, Vercel deploy with env vars, a Playwright smoke test, README with an architecture diagram |
| 3 · Showcase | A 2-minute demo video, a case study (linking Apps 1 and 2 as "how it was built"), CV/Upwork/LinkedIn updates |

✍️ yours: the RLS policies, the save/list Server Actions, and moving retrieval to pgvector.

**Milestone C:** a full product with auth, history and evals. **Milestone D:** public, deployed and part of your profiles.

## 4. Common boilerplate

Every app starts with the same setup. It's deliberately small: nothing here needs a second look once it works.

### What's in it

| Area | Setup |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript, `src/` directory, `@/*` alias, Node 24 LTS (`.nvmrc`, `engines`) |
| UI | Tailwind CSS, shadcn/ui (Base UI, `nova` preset, neutral, CSS variables) with its default paths (`@/components/ui`, `@/lib/utils`); button, card, textarea, badge and sonner (with `<Toaster />` in the root layout) |
| Formatting | Prettier: no semicolons, single quotes, `printWidth` 80, `trailingComma: 'es5'`, `arrowParens: 'always'`; `@trivago/prettier-plugin-sort-imports` (`react`/`next` → third-party → `@/components/ui/*` → other `@/*` → relative) and `prettier-plugin-tailwindcss` (last, with `tailwindStylesheet: './src/app/globals.css'` and `tailwindFunctions: ['cn', 'cva']`). `.prettierignore`: build output, `node_modules`, `public`, lockfiles, logs, `next-env.d.ts` and `docs/plans/` (plans are replaced whole, never reformatted) |
| Linting | The ESLint config `create-next-app` generates, unchanged |
| Tests | Vitest with `vitest.config.mts` (the `.mts` extension loads it as ESM without `"type": "module"`), node environment, `@/*` alias via Vite's built-in `resolve.tsconfigPaths: true` (no extra plugin); used for pure functions like the cost helper, the diff parser and eval scorers |
| AI | `ai`, `@ai-sdk/anthropic`, `zod` |
| Env | `.env.local` with `ANTHROPIC_API_KEY` (the Anthropic provider reads it automatically), `.env.example` with placeholders, `.env*` ignored except `.env.example`. No env validation layer |
| AI helpers | `src/lib/ai/models.ts`: the model IDs (`dev` = Haiku 4.5, `demo` = Sonnet 5) and nothing else. `src/lib/ai/cost.ts`: a price table and `estimateCost(modelId, usage)` with a unit test ✍️ |
| Smoke test | `scripts/ping.ts` ✍️, run with `npm run ping`: one `generateText` call that prints the text, `usage`, `finishReason` and the estimated cost; `.env.local` loaded with Node's built-in `--env-file` (`tsx --env-file=.env.local scripts/ping.ts`, so no `dotenv`); an optional argument picks the model (`npm run ping -- demo`) |
| Scripts | `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, `test:watch`, `ping`. `typecheck` is `next typegen && tsc --noEmit`: CI runs it before `build` on a fresh checkout, so the route types (`LayoutProps`, `PageProps`) must be generated first |
| CI | GitHub Actions on push and pull request: `npm ci`, then `format:check`, `lint`, `typecheck`, `test`, `build`. No API keys needed |
| Claude Code | A short `AGENTS.md` with the project instructions (see below), `CLAUDE.md` containing only `@AGENTS.md`, `agentRules: false` in `next.config.ts` (so `next dev` doesn't re-insert its Next.js block), and `.claude/settings.json` denying reads of `.env` and `.env.*` |
| Versions | Exact versions pinned (`save-exact=true` in `.npmrc`), `package-lock.json` committed |

**Not in the boilerplate:** Zod env validation, `server-only` wrappers, module folders, import-boundary lint rules, a `shared/` folder. If an app ever needs one of these, its app plan adds it.

### Folder layout

```
<app>/                      ← the repo root
├── docs/plans/             ← general-plan.md and <app>-plan.md
├── scripts/ping.ts
├── src/
│   ├── app/                ← routes and API route handlers
│   ├── components/         ← app components; components/ui for shadcn
│   └── lib/
│       ├── ai/             ← models.ts, cost.ts and the app's AI code (prompts, schemas, tools)
│       └── utils.ts
├── AGENTS.md               ← project instructions for coding agents
├── CLAUDE.md               ← just `@AGENTS.md`
├── NOTES.md                ← learning notes and interview talking points
└── .claude/settings.json
```

### AGENTS.md contents

- **Project:** one paragraph on what the app does, with links to `docs/plans/general-plan.md` and `docs/plans/<app>-plan.md`.
- **Stack:** Next.js 16, AI SDK 7, Zod, shadcn/ui, Tailwind, npm, Node 24. These may be newer than the model's training data, so check installed versions and the current docs. The docs for the installed versions are in `node_modules/next/dist/docs/` (Next.js) and `node_modules/ai/docs/` (AI SDK); AI SDK 7 renamed several APIs (see the table in the app plan).
- **Commands:** `npm run dev`, `build`, `lint`, `typecheck`, `test`, `ping`. Run `npm run lint && npm run typecheck && npm test` before saying you're done.
- **Rules:** never read `.env*` files; use Haiku for all dev calls; use npm and ask before adding dependencies; name models only in `src/lib/ai/models.ts`.
- **Learning mode:** work on the task I name. ✍️ tasks are mine by default: review my code or answer questions instead of writing it, unless I ask you to write it. For bigger 🤖 tasks, show a plan first.

### Boilerplate setup prompt

Use this as task 0 of App 1 and App 2. The folder already contains `docs/plans/` and a git repo. `create-next-app` accepts a folder that only has `docs/` and `.git` in it.

```text
Set up the common boilerplate from section 4 of docs/plans/general-plan.md in this repo.
- The repo already has docs/plans/ and .git. Keep docs/ untouched.
- create-next-app (latest, --use-npm) in the current folder: TypeScript, App Router, ESLint, Tailwind CSS, src/ directory, import alias @/*.
- shadcn/ui: `npx shadcn@latest init --base base --preset nova` with default paths; add button, card, textarea, badge, sonner and mount <Toaster /> in the root layout. Check that the root layout's sans font variable matches `--font-sans` in globals.css.
- Prettier and .prettierignore exactly as described in section 4, then format the whole repo once (docs/plans/ is ignored).
- Vitest (vitest.config.mts, node environment, @/* alias via resolve.tsconfigPaths), with one trivial passing test.
- Install ai, @ai-sdk/anthropic and zod. Create src/lib/ai/models.ts with the dev and demo model IDs. Create .env.example and make sure .env.local is ignored and .env.example isn't.
- Leave src/lib/ai/cost.ts and scripts/ping.ts to me (✍️), but add the "ping" script to package.json.
- Scripts, CI workflow, .nvmrc, engines, .npmrc and pinned versions as described in section 4. Put @types/node on the Node 24 line (create-next-app installs ^20, which conflicts with Vitest 5).
- AGENTS.md with the contents from section 4 (replacing the Next.js block create-next-app generates), CLAUDE.md containing only `@AGENTS.md`, `agentRules: false` in next.config.ts, and .claude/settings.json denying Read(.env) and Read(.env.*).
- Home page: the app name and a one-line description.
AI SDK 7 and Next.js 16 may be newer than you know: check installed versions and current docs. Show me the plan first. When done, run format:check, lint, typecheck, test and build.
```

## 5. Stack

Next.js 16 (App Router) · TypeScript · AI SDK 7 · `@ai-sdk/anthropic` · Zod · shadcn/ui · Tailwind · Vitest · npm · Vercel. App 3 adds Supabase (`@supabase/ssr`, Postgres, pgvector) and Playwright (smoke test).

Models: `claude-haiku-4-5` ($1/$5 per million input/output tokens) for development, `claude-sonnet-5` ($2/$10) for demos and eval comparisons.

## 6. How each app plan is structured

Each app gets one file, `docs/plans/<app>-plan.md` (e.g. `docs/plans/ai-review-basics-plan.md`):

1. **Learning goals:** the concepts to understand, not just use.
2. **Reading list:** direct links to official docs, kept short.
3. **Scope:** what's in and out.
4. **Stages and tasks:** each task sized for one Claude Code session and marked ✍️ or 🤖, with a ready-to-paste prompt for 🤖 tasks, what to write for ✍️ tasks, and acceptance criteria.
5. **Definition of done:** a checklist.
6. **Learning note and talking points:** written into the app's `NOTES.md`.
7. **Cost notes:** expected token spend and which model to use.

## 7. Working with Claude Code

- Workflow per task: name the task, review the plan for bigger 🤖 tasks, implement, run the checks, review the diff yourself, commit.
- One branch and one PR per stage (e.g. `stage-1-core`), merged into `main` once CI is green.
- When a stage is done, add its learning note and talking points to `NOTES.md`.

## 8. Where the plans live and how to start an app

Each repo has a `docs/plans/` folder with a copy of this general plan and that app's plan. The folder is committed, so Claude Code can always read the current plan. `create-next-app` accepts a folder that only contains `docs/` and `.git`, so the plans can be in place before the scaffold.

To start an app:

1. Create the folder `~/learning/<app>/` and an empty GitHub repo with the same name (public, no README or `.gitignore`).
2. Put `general-plan.md` and `<app>-plan.md` into `~/learning/<app>/docs/plans/`.
3. In `~/learning/<app>/`:

   ```bash
   git init -b main
   git add docs/plans
   git commit -m "Add learning plans"
   git remote add origin <repo URL>
   git push -u origin main
   git checkout -b stage-0-boilerplate
   ```

4. Open Claude Code in `~/learning/<app>/` and say: "Read @docs/plans/general-plan.md and @docs/plans/<app>-plan.md. We're starting T0.1." Until task 0 creates `CLAUDE.md`, add: "✍️ tasks are mine unless I ask you to write them. Show a plan first. Never read .env* files."
5. Create `.env.local` yourself with your API key once task 0 has created `.env.example`. The Claude Console workspace, key and spend limit from the old M0 are reused.

## 9. Decisions

1. Three apps, three repos: `ai-review-basics`, `ai-review-agent`, `ai-code-review-assistant`, each created from scratch. The old single-repo attempt is deleted.
2. One common boilerplate, set up by one prompt. No env validation, module structure or custom lint rules.
3. App 2 starts from a fresh boilerplate; App 3 starts as a copy of App 2.
4. RAG vector store: local in App 2, moved to Supabase pgvector in App 3.
5. Generative UI is optional, in App 2.
6. Plans live in `docs/plans/` in each repo.
7. Pace: about 8–10 hours a week. Plan language: English. Package manager: npm.
