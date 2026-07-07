# sdet-portfolio

A TypeScript + Playwright test automation portfolio, built as the running
interview artifact for a self-directed **SDET Roadmap: Beginner → Advanced**
(~16 weeks, ~10-12 hrs/week). Each phase of the roadmap adds to this same
repo rather than starting a new project, so the commit history itself
demonstrates how the framework evolved from a single "hello world" test into
a structured automation suite.

A recurring practice across every phase is **AI-assisted coding as a working
method, not a shortcut** — using an AI pairing partner to scaffold config,
review code against SOLID principles, propose architectural tradeoffs, debug
CI failures, and generate schemas/test cases, while always requiring a
written explanation of *why* a suggestion is correct before accepting it.

## Roadmap & progress

| Phase | Focus | Status |
|---|---|---|
| 0 — Setup & Git Hygiene | TS config, linting, first Playwright test (headed + headless) | ✅ Done |
| 1 — Programming Foundations | TS fundamentals, OOP, SOLID, standalone utility lib + unit tests | ⏳ Not started |
| 2 — Playwright Fundamentals | Locators, auto-waiting, assertions, fixtures/hooks, 10-15 UI tests | 🚧 In progress (1 UI test so far) |
| 3 — Framework Architecture | POM/Screenplay, custom fixtures, factory/builder patterns, `/src` structure | ⏳ Not started |
| 4 — API Test Automation | `APIRequestContext`, CRUD + negative cases, schema validation, API-seeded UI state | 🚧 In progress (CRUD suite + reusable client done; schema validation and API-seeded UI tests pending) |
| 5 — CI/CD & Test Infrastructure | GitHub Actions, sharding, HTML/Allure reporting, flaky-test policy | ⏳ Not started |
| 6 — Maintainability & QE | Test pyramid strategy, risk-based prioritization, visual/a11y testing, strategy doc | ⏳ Not started |
| 7 — Advanced & Specialization | BDD, component testing, security testing, mobile/monorepo patterns | ⏳ Not started |

## What's in here

- **UI testing** — [`tests/hello.spec.ts`](tests/hello.spec.ts): a login flow
  test against [SauceDemo](https://www.saucedemo.com/), covering locators,
  navigation, and assertions.
- **API testing** — [`tests/api.spec.ts`](tests/api.spec.ts): a CRUD test
  suite against the [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
  fake REST API, covering happy-path and error-case scenarios (GET, POST,
  PUT, PATCH, DELETE, 404s, invalid input).
- **Reusable API client** — [`tests/support/jsonPlaceholderClient.ts`](tests/support/jsonPlaceholderClient.ts):
  wraps `APIRequestContext` in a small client class (init/dispose lifecycle,
  one method per endpoint) so tests call `client.getPost(1)` instead of
  repeating raw `request.get(...)` calls and base URLs everywhere.
- **TypeScript fundamentals notes** — [`learn/typescript-fundamentals.ts`](learn/typescript-fundamentals.ts):
  a scratch file used to work through core TS/JS concepts (JSON parsing,
  `stringify`, etc.) needed to write and reason about the tests above.

## Getting started

```bash
npm install
npx playwright install   # first time only — downloads browser binaries
```

## Running tests

```bash
npm test              # run the full suite headless
npm run test:headed   # run with a visible browser
npx playwright test tests/api.spec.ts   # run a single file
```

Test results and traces are written to `playwright-report/` and
`test-results/` (both gitignored) — open the HTML report with:

```bash
npx playwright show-report
```

## Linting & formatting

```bash
npm run lint
npm run format
```

## Project config reference

The rest of this README documents every setting in the project's config
files, line by line, so the reasoning behind each choice is on record — not
just the working config.

## tsconfig.json

```json
{
  "compilerOptions": {
```
Everything under `compilerOptions` controls how `tsc` type-checks the project. Nothing here compiles to a shipped artifact — see `noEmit` below.

```json
    "target": "ES2022",
```
Tells TypeScript which JS syntax features are safe to assume at runtime (e.g. top-level `await`, class fields, `Array.at`). Set to `ES2022` because the project targets a modern Node runtime (18+), which supports it natively — no down-leveling needed.

```json
    "lib": ["ES2022"],
```
Declares which built-in type definitions are loaded — this is about *type declarations*, not runtime polyfills. Deliberately **excludes `"dom"`**: test files run in Node and talk to the browser through Playwright's API (`page.click()`, `page.locator()`), not by touching `window`/`document` directly. Leaving DOM types out means an accidental reference to a browser global inside a test (as opposed to inside a `page.evaluate()` callback) fails type-checking instead of silently compiling.

```json
    "module": "commonjs",
```
Sets the output module format. Node treats `.ts`/`.js` files as CommonJS by default unless `package.json` declares `"type": "module"`, and Playwright's test loader itself expects CommonJS-style resolution out of the box. Matches the runtime, avoiding `require`/`import` interop errors.

```json
    "moduleResolution": "node",
```
Uses Node's own module lookup algorithm (walk up `node_modules`, resolve `index.ts`, respect `package.json` `main`/`types` fields) rather than bundler-style resolution. Correct because there's no bundler in this pipeline — tests run directly under Node via Playwright's runner.

```json
    "types": ["node", "@playwright/test"],
```
Restricts *ambient* global types to just these two packages, instead of TypeScript auto-including every `@types/*` package found in `node_modules`. This matters in a test repo because it's common to end up with multiple test frameworks' type packages installed side by side (e.g. Jest types from a shared tooling package) — auto-inclusion would let their conflicting global `expect`/`describe` declarations clash with Playwright's.

```json
    "strict": true,
```
A single flag that turns on the full strict family (`noImplicitAny`, `strictNullChecks`, `strictBindCallApply`, etc.). In test code specifically, `strictNullChecks` is the one that pays off most: it forces handling of `null`/`undefined` from things like `await locator.textContent()`, which returns `string | null`.

```json
    "noUncheckedIndexedAccess": true,
```
Beyond base `strict`, this adds `| undefined` to the result of any index-signature lookup — `record[key]` or `array[i]`. Directly relevant to test data handling: pulling a value out of a fixture map or an env-var-driven config object (`testUsers[role]`) now forces a check that the key actually existed, instead of assuming it and getting a runtime `undefined` deep inside a test step.

```json
    "esModuleInterop": true,
```
Allows `import foo from 'some-cjs-package'` for packages that don't have a real ES default export, and adds the interop helper TypeScript needs to make that work correctly at runtime. Needed because most Node ecosystem packages (including several Playwright helper libs) are still published as CommonJS.

```json
    "forceConsistentCasingInFileNames": true,
```
Errors if a file is imported with a casing that doesn't match its actual filename on disk (`Login.page.ts` vs `login.page.ts`). macOS and Windows filesystems are case-insensitive by default, so this kind of mismatch compiles and runs fine locally — then fails on a case-sensitive Linux CI runner. This flag catches it before CI does.

```json
    "skipLibCheck": true,
```
Skips type-checking inside `.d.ts` files pulled from `node_modules`. Speeds up the check and avoids spurious errors caused by two dependencies shipping slightly incompatible bundled types — a real risk once Playwright, ESLint's TS plugin, and their transitive deps are all installed together.

```json
    "resolveJsonModule": true,
```
Lets `import data from './fixtures/user.json'` work with proper typing instead of erroring or falling back to `any`. Test suites frequently keep data-driven fixtures as JSON; this keeps that data type-checked at the call site.

```json
    "isolatedModules": true,
```
Requires every file to be transpilable on its own, without whole-program type information (e.g. it disallows re-exporting a `type` without the `export type` syntax). This isn't a style preference — it's a correctness constraint: Playwright's runner transpiles each test file independently through esbuild rather than running the full `tsc` pipeline, and esbuild can't see across files the way `tsc` can. This flag makes `tsc` flag anything that would break under that per-file transpilation before it does.

```json
    "noEmit": true,
```
`tsc` here is used purely as a type-checker (`tsc --noEmit` in CI, or via editor integration) — it never produces `.js` output. Playwright doesn't consume compiled output; it transforms `.ts` on the fly per test run. Emitting anyway would create a stale, unused `dist/` folder.

```json
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["tests/fixtures/*"],
      "@pages/*": ["tests/pages/*"],
      "@utils/*": ["tests/utils/*"]
    }
```
`baseUrl` sets the root that the `paths` aliases below are resolved relative to. The aliases let test files import via `@pages/login.page` instead of `../../../pages/login.page`. Page objects, fixtures, and utils tend to get reorganized as a suite grows; aliases mean those moves don't require touching every import path across the test tree.

```json
  },
  "include": ["tests/**/*.ts", "playwright.config.ts"],
```
Scopes type-checking to the test tree and the Playwright config itself — the only TypeScript in this repo.

```json
  "exclude": ["node_modules", "test-results", "playwright-report"]
```
Excludes dependency code and Playwright's own generated run artifacts (screenshots, traces, HTML reports) from being scanned, since they're not source and can contain arbitrary file types Playwright writes out after a run.
```json
}
```

## eslint.config.mjs

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
```
Four building blocks: base JS rules, TypeScript-aware rules/parser, Playwright-specific test rules, and a config that turns off any ESLint rule that would fight with Prettier's formatting.

```js
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
```
Flat-config array: start from ESLint's recommended JS rules, then layer TypeScript's recommended rules (type-aware linting: no floating promises patterns, no unnecessary type assertions, etc.).

```js
  {
    files: ['tests/**/*.ts'],
    plugins: { playwright },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
```
Scopes the Playwright plugin to only the `tests/` directory, and pulls in its recommended rule set as a baseline — things like disallowing focused tests (`test.only`) from being committed.

```js
      'playwright/no-conditional-in-test': 'error',
```
Bans `if`/`switch`/ternary branching inside a `test()` body. Conditional logic inside a test almost always means the test is silently covering multiple scenarios — when it fails, you can't tell which branch broke without re-reading the test. Forces splitting into separate, individually-nameable tests instead.

```js
      'playwright/no-wait-for-timeout': 'error',
```
Bans `page.waitForTimeout()`. Fixed-duration sleeps are the most common source of both flakiness (too short under load) and wasted CI time (too long as a "safe" margin). This rule pushes toward condition-based waits (`locator.waitFor()`, auto-retrying `expect()`), which wait exactly as long as needed and no longer.

```js
      'playwright/no-networkidle': 'error',
```
Bans `waitUntil: 'networkidle'`. It's a known-unreliable signal — pages with polling, analytics beacons, or websockets never go fully idle, so tests relying on it either time out or wait far longer than necessary. Forces waiting on an explicit element/response instead.

```js
      'playwright/valid-expect': 'error',
    },
  },
```
Catches malformed `expect()` calls — e.g. an assertion method that doesn't exist, or an `expect()` call missing its matcher — which would otherwise fail silently or throw a confusing runtime error instead of a lint error.

```js
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
```
Flags unused variables project-wide (dead code, leftover debug imports) but exempts function parameters prefixed with `_` — needed because Playwright fixture callbacks often require positional parameters (`async ({ page }, testInfo) => ...`) even when a given test doesn't use all of them.

```js
  prettier,
```
Disables every ESLint rule that overlaps with Prettier's formatting (indentation, quote style, etc.), so the two tools never disagree about the same line.

```js
  {
    ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**', 'dist/**'],
  },
);
```
Flat-config's way of excluding directories from linting entirely — generated/dependency directories that aren't source.

## .prettierrc.json

```json
{
  "printWidth": 100,
```
Line-wrap width. Raised from Prettier's 80-column default because Playwright locator chains — `page.getByRole('button', { name: 'Submit' }).click()` — wrap awkwardly and become harder to read at 80.

```json
  "singleQuote": true,
```
Use `'...'` over `"..."` in JS/TS. Stylistic, but kept consistent with `eslint-plugin-playwright`'s own examples and the wider Playwright ecosystem convention.

```json
  "semi": true,
```
Always print semicolons. Avoids ASI (automatic semicolon insertion) edge cases — rare, but a class of bug not worth having in test code that's meant to be the source of truth for "did the app behave correctly."

```json
  "trailingComma": "all",
```
Adds a trailing comma on the last item of multiline arrays/objects/function args. Keeps diffs to a single added line when a new parameter is added to a `test.describe`/`test.use()` block or a new field to a fixture object — without it, adding an item also modifies the previous line just to add a comma.

```json
  "arrowParens": "always",
```
Always wraps a single arrow-function argument in parens: `(x) => x` instead of `x => x`. Makes it a no-diff change later to add a second parameter or a type annotation to that argument.

```json
  "endOfLine": "lf"
}
```
Forces Unix line endings regardless of OS. Prevents an entire file from showing as changed in a diff just because it was edited on Windows (which defaults to CRLF).

## .prettierignore

```
node_modules
test-results
playwright-report
blob-report
dist
```
Directories Prettier should never try to format — dependency code and Playwright's generated run output (HTML reports, blob reports for merging sharded runs, screenshots/traces).

## .gitignore

```
node_modules/
```
Dependency tree — reinstalled from `package.json`/lockfile, never committed.

```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```
All Playwright-generated run output: raw per-test artifacts (screenshots, videos, traces) in `test-results/`, the HTML report in `playwright-report/`, per-shard reports meant to be merged in `blob-report/`, and browser-download metadata in `playwright/.cache/`. These regenerate on every run; committing them bloats the repo (traces alone can run several MB each) and produces diffs with no relation to actual code changes.

```
# Environment / secrets
.env
.env.local
```
Test suites commonly need environment-scoped secrets — staging API keys, seeded test-account credentials — to point the same suite at different environments. These must never reach version control.

```
# Build output
dist/
```
Reserved for if a build step is ever added (there isn't one yet — see `noEmit` in `tsconfig.json`); kept as a placeholder so it's ignored automatically if that changes.

```
# Editor / OS
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
```
Ignores personal editor settings but keeps `.vscode/extensions.json` — the one file worth sharing, since it can recommend the Playwright Test extension to anyone who opens the repo. `.idea/` and `.DS_Store` are JetBrains and macOS Finder artifacts, respectively — machine-specific, never relevant to the code.

```
# Logs
npm-debug.log*
```
npm writes this file on install failures; it's diagnostic output for that one machine, not something to track.
