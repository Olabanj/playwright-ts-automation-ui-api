# sdet-portfolio

A TypeScript + Playwright test automation portfolio. Each phase of the roadmap adds to this same
repo rather than starting a new project, so the commit history itself
demonstrates how the framework evolved from a single "hello world" test into
a structured automation suite.


## Skills demonstrated

A quick map from "what's in this repo" to the SDET competencies it's meant
to prove, for anyone reviewing this as a hiring artifact:

| Skill | Where |
|---|---|
| API CRUD + negative-case testing | [`tests/api/api.spec.ts`](tests/api/api.spec.ts) |
| Multi-hop chained API flows (data flowing between requests) | [`tests/api/api.spec.ts`](tests/api/api.spec.ts) — `Chained lookup` and `Chained lifecycle` suites |
| Contract/schema validation (Zod) | [`src/schemas/product.schema.ts`](src/schemas/product.schema.ts), [`tests/api/schema-demo.spec.ts`](tests/api/schema-demo.spec.ts) |
| Page Object Model (4 pages) | [`src/pages/`](src/pages/) — `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage` |
| Custom Playwright fixtures (dependency injection) | [`src/fixtures/api.fixtures.ts`](src/fixtures/api.fixtures.ts), [`src/fixtures/ui.fixtures.ts`](src/fixtures/ui.fixtures.ts) (authenticated-session fixture) |
| Reusable API client (service-object pattern) | [`src/utils/jsonPlaceholderClient.ts`](src/utils/jsonPlaceholderClient.ts) |
| Synthetic test-data generation | [`src/utils/testDataFactory.ts`](src/utils/testDataFactory.ts) |
| Environment configuration | [`src/config/env.ts`](src/config/env.ts) |
| UI test automation (15 tests: login, inventory, cart, checkout) | [`tests/ui/`](tests/ui/) |
| Auth patterns (bearer, API key, OAuth+storageState) | [`tests/api/authPattern.spec.ts`](tests/api/authPattern.spec.ts) |
| API-seeded UI setup pattern | [`tests/api/chainingApiCall.spec.ts`](tests/api/chainingApiCall.spec.ts) |
| CI/CD: tagged smoke-on-PR + nightly regression, 4-way sharding, merged HTML reports, GitHub Pages publishing, Slack/webhook failure alerts | [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) |
| Test strategy & quality engineering (pyramid, risk-based prioritization, flakiness policy, metrics) | [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md) |

## Roadmap & progress

| Phase | Focus | Status |
|---|---|---|
| 0 — Setup & Git Hygiene | TS config, linting, first Playwright test (headed + headless) | Done |
| 1 — Programming Foundations | TS fundamentals, OOP, SOLID, standalone utility lib + unit tests | ⏳ Not started |
| 2 — Playwright Fundamentals | Locators, auto-waiting, assertions, fixtures/hooks, 10-15 UI tests | ✅ Done (15 UI tests across login/inventory/cart/checkout against SauceDemo, via Page Objects and an authenticated-session fixture) |
| 3 — Framework Architecture | POM/Screenplay, custom fixtures, factory/builder patterns, `/src` structure | ✅ Done (`/src` reorg with `pages`/`fixtures`/`utils`/`config`/`schemas`, 4 Page Objects, custom `apiClient` and `loggedInPage` fixtures, centralized env config; Screenplay pattern and Builder/Singleton not covered) |
| 4 — API Test Automation | `APIRequestContext`, CRUD + negative cases, schema validation, API-seeded UI state | ✅ Done (CRUD + negative cases + chained flows + Zod schema validation; API-seeded-UI is a documented reference pattern pending a real backend) |
| 5 — CI/CD & Test Infrastructure | GitHub Actions, sharding, HTML/Allure reporting, flaky-test policy | ✅ Done (smoke-on-PR + nightly regression, 4-way sharding, merged HTML reports, GitHub Pages publishing, Slack/webhook failure alerts, CI retries) |
| 6 — Maintainability & QE | Test pyramid strategy, risk-based prioritization, visual/a11y testing, strategy doc | Done |
| 7 — Advanced & Specialization | BDD, component testing, security testing, mobile/monorepo patterns | ⏳ Not started |

## What's in here

Framework code lives in `/src` (reusable across the suite); specs live in
`/tests`, split by layer (`ui/`, `api/`):

```
/src
  /pages      -> Page Objects (LoginPage, InventoryPage, CartPage, CheckoutPage)
  /fixtures   -> custom Playwright fixtures (apiClient, loggedInPage)
  /utils      -> reusable client + synthetic test-data factory
  /config     -> environment config (base URLs)
  /schemas    -> Zod contract schemas
/tests
  /ui         -> UI specs (use src/pages)
  /api        -> API specs (use src/fixtures, src/utils, src/schemas)
```

- **UI testing** — 15 tests against [SauceDemo](https://www.saucedemo.com/),
  each driven through a Page Object rather than inline locators:
  - [`tests/ui/login.spec.ts`](tests/ui/login.spec.ts) (5): valid login
    (tagged `@smoke`), locked-out user, wrong password, empty username, empty
    password.
  - [`tests/ui/inventory.spec.ts`](tests/ui/inventory.spec.ts) (4): product
    count, sort-by-price ordering, add-to-cart badge count, remove-from-cart
    badge count.
  - [`tests/ui/cart.spec.ts`](tests/ui/cart.spec.ts) (3): item appears after
    adding, removing empties the cart, checkout navigation.
  - [`tests/ui/checkout.spec.ts`](tests/ui/checkout.spec.ts) (3): required-field
    validation, order total on the overview step, order confirmation.
- **Page Objects** — [`src/pages/`](src/pages/): `LoginPage`, `InventoryPage`,
  `CartPage`, `CheckoutPage` — each wraps one page's locators and actions
  behind a class, so tests read as intent, not raw selectors.
- **UI authenticated-session fixture** — [`src/fixtures/ui.fixtures.ts`](src/fixtures/ui.fixtures.ts):
  a `loggedInPage` fixture that logs in once via `LoginPage` before the test
  body runs, so inventory/cart/checkout tests start already authenticated
  instead of repeating login steps.
- **API testing** — [`tests/api/api.spec.ts`](tests/api/api.spec.ts): a CRUD
  test suite against the [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
  fake REST API — happy-path and error-case scenarios (GET, POST, PUT,
  PATCH, DELETE, 404s, invalid input) — plus two `test.describe.serial`
  chained-flow suites where each step's response feeds the next request: a
  read-only `post → author → author's posts → comments` traversal over real
  seeded data, and a `create → patch → delete` lifecycle using the id the
  server actually assigns.
- **Reusable API client** — [`src/utils/jsonPlaceholderClient.ts`](src/utils/jsonPlaceholderClient.ts):
  wraps `APIRequestContext` in a small client class (init/dispose lifecycle,
  one method per endpoint) so tests call `client.getPost(1)` instead of
  repeating raw `request.get(...)` calls and base URLs everywhere.
- **Environment config** — [`src/config/env.ts`](src/config/env.ts): centralizes
  `API_BASE_URL` and `UI_BASE_URL` (each overridable via env var, defaulting
  to JSONPlaceholder/SauceDemo) so the client and Page Object don't hardcode
  URLs directly.
- **Custom Playwright fixture** — [`src/fixtures/api.fixtures.ts`](src/fixtures/api.fixtures.ts):
  extends Playwright's base `test` with an `apiClient` fixture that inits
  and disposes a fresh `JsonPlaceholderClient` automatically per test —
  tests just declare `async ({ apiClient }) => {...}`, no manual lifecycle
  management.
- **Schema/contract validation** — [`src/schemas/product.schema.ts`](src/schemas/product.schema.ts)
  defines a Zod schema with required/optional fields, an enum-restricted
  category, a nested object, and real formats (positive ints, email, ISO
  datetime, bounded percentage); [`tests/api/schema-demo.spec.ts`](tests/api/schema-demo.spec.ts)
  validates sample payloads against it.
- **Synthetic test data** — [`src/utils/testDataFactory.ts`](src/utils/testDataFactory.ts):
  a `generateProduct()` factory (via `@faker-js/faker`) so create/update
  tests assert against generated values instead of hardcoded literals that
  would collide across parallel runs.
- **Auth pattern reference** — [`tests/api/authPattern.spec.ts`](tests/api/authPattern.spec.ts):
  bearer token, API key, and OAuth-via-`storageState` patterns for test
  setup. Runnable tests are marked `.skip` with a comment, since they target
  illustrative endpoints with no real backend behind them yet.
- **API-seeded UI setup reference** — [`tests/api/chainingApiCall.spec.ts`](tests/api/chainingApiCall.spec.ts):
  seeding state via API calls to skip slow UI setup (create a user + order,
  then verify only the UI behavior that matters), plus a fixture-wrapped
  variant and a chained multi-call scenario. Also reference-only, `.skip`ped
  pending a real backend.
- **CI/CD pipeline** — [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml):
  see the [CI/CD](#cicd) section below.
- **Test Strategy doc** — [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md):
  pyramid breakdown, risk-based prioritization, flakiness root-causing and
  policy, test data management strategies, shift-left practices, metrics
  that matter (and why coverage % isn't tracked), and proposed visual/a11y/
  performance checks.
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
npm run test:smoke     # run only tests tagged @smoke
npm run test:headed   # run with a visible browser
npx playwright test tests/api/api.spec.ts   # run a single file
```

Test results and traces are written to `playwright-report/` and
`test-results/` (both gitignored) — open the HTML report with:

```bash
npx playwright show-report
```

CI runs with 2 retries per failing test (`retries: process.env.CI ? 2 : 0`
in `playwright.config.ts`); local runs fail immediately with no retries, so
flakiness isn't masked while actively debugging.

## CI/CD

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs
two tiers, each sharded across 4 parallel jobs with per-shard blob reports
merged into one downloadable HTML report:

- **Smoke** — on every PR targeting `main`. Runs only the 4 tests tagged
  `@smoke` (the SauceDemo login + 3 core CRUD happy paths) for fast
  feedback.
- **Regression** — nightly at 2am UTC (plus manual `workflow_dispatch`).
  Runs the entire suite, no tag filter.

On a failing regression run, a `notify-regression-failure` job posts to a
Slack/webhook URL (`SLACK_WEBHOOK_URL` repo secret) with a link straight to
the failed run. A `publish-report` job also deploys the merged HTML report
to GitHub Pages (requires enabling **Settings → Pages → Source → GitHub
Actions** once), so the latest regression results are viewable at a public
URL, not just as a downloadable artifact.

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
      "@fixtures/*": ["src/fixtures/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"],
      "@config/*": ["src/config/*"],
      "@schemas/*": ["src/schemas/*"]
    }
```
`baseUrl` sets the root that the `paths` aliases below are resolved relative to. The aliases let test files import via `@pages/LoginPage` instead of `../../../src/pages/LoginPage`. Page objects, fixtures, and utils tend to get reorganized as a suite grows (this project's own `/src` reorg moved every one of these); aliases mean those moves don't require touching every import path across the test tree — only the `paths` targets here.

```json
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "playwright.config.ts", "learn/**/*.ts"],
```
Scopes type-checking to the framework code (`src/`), the test tree, the Playwright config, and the standalone learning notes — the only TypeScript in this repo.

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
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    plugins: { playwright },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
```
Scopes the Playwright plugin to the `tests/` directory and `src/` (framework
code — fixtures, page objects, utils — that also uses Playwright's APIs),
and pulls in its recommended rule set as a baseline — things like
disallowing focused tests (`test.only`) from being committed, and (the
reason `src/` needed including) an override for the base `no-empty-pattern`
rule, since a fixture with no dependencies still destructures an empty `{}`
as its first parameter — valid Playwright syntax that plain ESLint would
otherwise flag as an error.

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
    ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**', 'blob-report/**', 'dist/**'],
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
