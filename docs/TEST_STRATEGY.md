# Test Strategy — sdet-portfolio

Internal-style strategy doc for this project. States what we automate, what
we don't, why, and how we'd know if the strategy stopped working. Written to
reflect the project's *actual* current state (see the roadmap table in the
root [README](../README.md)), not an aspirational rewrite — gaps are called
out explicitly rather than glossed over.

## 1. Test pyramid

```
        /\
       /UI\        few, slow, expensive — golden paths only
      /------\
     /  API   \    the bulk of the suite — business logic, contracts
    /----------\
   /    Unit    \  fastest, cheapest, most numerous
  /--------------\
```

Target split: **~70% unit / 20% API / 10% UI**. The reasoning: a UI test
exercises the browser, the network, *and* the business logic all at once —
if it fails, you don't know which layer broke, and it's the slowest, most
flake-prone layer to run in bulk. Unit tests isolate one function/class with
no I/O, so they're cheap enough to write hundreds of and fast enough to run
on every keystroke. API tests sit in between: no browser rendering cost, but
still validate real request/response contracts and business rules across
the network boundary.

**Where this project actually stands:** heavily API-weighted by design —
[`tests/api/api.spec.ts`](../tests/api/api.spec.ts) covers CRUD, negative cases, and
chained multi-call flows against JSONPlaceholder, plus schema-contract tests
in [`tests/api/schema-demo.spec.ts`](../tests/api/schema-demo.spec.ts). UI is
deliberately thin: one smoke test
([`tests/ui/hello.spec.ts`](../tests/ui/hello.spec.ts)) covering the SauceDemo
login golden path, not a full UI regression suite. **Unit is the current
gap** — there's no standalone utility/data-factory layer with its own unit
tests yet (tracked as roadmap Phase 1). Until that lands, the pyramid here
is really API-heavy with a UI cap, not a true pyramid.

## 2. Risk-based prioritization

Not everything earns an automated test — automation has an ongoing
maintenance cost, so it should go where being wrong is expensive. We
prioritize by **blast radius × change frequency**:

| Priority | Examples in this project | Why |
|---|---|---|
| Must automate | CRUD contract of the core resource, negative/edge cases (404, invalid id, invalid endpoint) | Silent contract breaks affect every consumer of the API |
| Must automate | Login golden path | Highest-traffic UI flow; if it breaks, nothing else matters |
| Nice to have | Chained cross-resource flows (post → author → comments) | Validates real relationships, not just isolated endpoints |
| Deliberately manual/skipped | Auth pattern variations, fintech-style chained scenarios in `authPattern.spec.ts` / `chainingApiCall.spec.ts` | Illustrative reference code against endpoints with no real backend yet — automating them now would just be testing a mock of a mock |
| Not worth automating | Pixel-perfect static content, rarely-changing marketing copy | Low blast radius, low change frequency — manual spot-check is cheaper than the ongoing maintenance of a brittle assertion |

## 3. Flakiness: root causes and policy

Three recurring root causes, and how this project's setup already guards
against each:

- **Race conditions** — asserting before async state settles. Guarded by
  banning `page.waitForTimeout()` and `waitUntil: 'networkidle'` at the lint
  level (`eslint-plugin-playwright` rules in
  [`eslint.config.mjs`](../eslint.config.mjs)) in favor of Playwright's
  auto-retrying `expect()`.
- **Test interdependence** — one test's leftover state breaking another.
  Guarded by the `apiClient` fixture
  ([`src/fixtures/api.fixtures.ts`](../src/fixtures/api.fixtures.ts))
  giving every test its own request context, init'd and disposed per test.
  Where tests *must* share state (the chained flows), that's made explicit
  via `test.describe.serial` rather than accidental ordering.
- **Environment drift** — "works locally, fails in CI." Guarded by pinning
  the same Node version locally and in CI, and using `npm ci` (not
  `npm install`) in the pipeline so CI installs exactly what's lockfiled.

**Policy:**
- A test that fails, is fixed, and fails again on the same PR gets
  quarantined (`test.fixme` with a comment linking the root cause), not left
  red blocking every other PR indefinitely.
- No `test.only` or unexplained `test.skip` merges to `main` — every skip in
  this repo currently carries a comment stating why (see
  `authPattern.spec.ts`).
- **Retries are configured**: `retries: process.env.CI ? 2 : 0` in
  `playwright.config.ts` — CI retries a failing test up to twice (absorbing
  a one-off network blip) while local runs fail immediately, so retries
  don't mask a real bug while you're actively debugging.

## 4. Test data management

| Strategy | Used here | Trade-off |
|---|---|---|
| Static fixtures | `src/schemas/product.schema.ts` sample objects | Fastest, fully deterministic — but only as realistic as you keep it |
| API seeding | Chained lifecycle test (`createPost` → capture id → act on it) | Exercises the real API, catches contract drift — slower, and only as reliable as the API's own persistence (JSONPlaceholder doesn't actually persist writes, a documented caveat in `api.spec.ts`) |
| DB seeding | Not applicable — we don't own JSONPlaceholder's backend | For a real owned service, this bypasses the API layer entirely for speed, at the cost of not exercising API-level validation |
| Synthetic/generated data | `generateProduct()` in [`src/utils/testDataFactory.ts`](../src/utils/testDataFactory.ts) (via `@faker-js/faker`), used in the create-product test and the chained lifecycle's create/patch steps | Avoids hardcoded literals colliding when tests run concurrently against a real, persistent backend — each run gets a fresh title/body/userId, and tests assert against the generated value rather than a fixed string |

## 5. Shift-left practices

Testing input happens before code merges, not after:
- Contract-first: a Zod schema (`ProductSchema`) is the agreed shape of a
  response — changing it is a visible, reviewable diff, not a silent runtime
  surprise discovered by a failing test days later.
- PR-time pairing: architecture decisions (e.g., custom fixture vs. POM,
  covered when building `api.fixtures.ts`) get discussed and justified in
  writing before the pattern is committed to, not retrofitted after a
  framework already exists.
- Acceptance criteria: negative cases (invalid id, invalid endpoint, missing
  resource) are written as explicit scenarios up front, not discovered as
  bug reports after release.

## 6. Metrics that matter

- **Defect escape rate** — bugs found in production ÷ total bugs found
  (pre-prod + prod). This is the real quality signal: it measures what
  testing *missed*.
- **Test execution time trend** — suite duration over time. This is why CI
  is sharded 4-way (`.github/workflows/playwright.yml`): as the suite grows,
  wall-clock time shouldn't silently creep past what a PR author will
  tolerate waiting for.
- **Coverage % — a vanity metric, deliberately not tracked here.** Line
  coverage tells you code *ran*, not that it was *verified correctly* — a
  test that calls a function and asserts nothing still counts as "covered."
  It's trivial to game and easy to misread as a quality signal when it's
  really just an activity signal. Defect escape rate and flaky-test count
  are truer signals of whether the suite is actually catching what matters.

### Metrics dashboard mockup

Mock data (no production history exists yet — this is the shape we'd track
once it does):

| Week | Pass rate | Flaky tests | Avg suite time | Defects escaped |
|---|---|---|---|---|
| W1 | 96% | 2 | 4m 10s | 1 |
| W2 | 98% | 1 | 3m 55s | 0 |
| W3 | 91% | 4 | 5m 20s | 2 |
| W4 | 99% | 0 | 3m 40s | 0 |

```
Pass rate %        Flaky test count        Avg suite time (s)
W1 ████████████░ 96   W1 ██          2      W1 ████████████████ 250
W2 █████████████ 98   W2 █           1      W2 ███████████████  235
W3 ███████████░░ 91   W3 ████        4      W3 ███████████████████ 320
W4 █████████████ 99   W4             0      W4 ██████████████   220
```

A real version of this would be a lightweight spreadsheet (or a Grafana
panel fed by CI job outputs) updated per nightly regression run — the point
of the mockup is the *shape*: trend lines matter more than any single run's
number.

## 7. Visual regression testing

**Not yet implemented — proposed.** Playwright's `expect(page).toHaveScreenshot()`
does pixel-diffing against a checked-in baseline, auto-updatable via
`--update-snapshots`. Best fit here: the SauceDemo inventory page after
login, catching unintended CSS/layout regressions. Caveat worth flagging
up front: baselines must be generated in the *same environment* they'll be
compared in (CI's Linux/Chromium build, not a local macOS run) — mismatched
font rendering between OSes is a well-known source of false-positive visual
diffs, i.e. visual testing has its own flakiness trap if set up carelessly.

## 8. Accessibility testing

**Not yet implemented — proposed.** `@axe-core/playwright` injects the axe
engine into a page already under test and asserts on violations:

```ts
import AxeBuilder from '@axe-core/playwright';

test('inventory page has no critical a11y violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical).toEqual([]);
});
```

Cheapest place to add it: tack it onto the existing SauceDemo login test
after it lands on the inventory page — the page is already loaded for the
login assertion, so an a11y check costs almost nothing extra to run.

## 9. Performance smoke checks

**Not yet implemented — proposed**, two different tools for two different
questions:
- **Playwright + Lighthouse** (`playwright-lighthouse`) for page-level
  budgets (LCP, TTI) on a handful of key pages — a smoke-level gate on
  every PR, not a full audit.
- **k6** for API load testing — concurrent request volume against the
  service, which Playwright itself isn't built for. This runs on a separate,
  less frequent cadence (e.g. weekly) since load tests are resource-heavy
  and not something you want gating every PR.

## Summary of current gaps

This doc intentionally documents what's missing, not just what exists, so
it stays honest as the project evolves:
- No unit-test layer yet (Phase 1)
- Visual regression, accessibility, and performance checks are proposed but
  not yet implemented
