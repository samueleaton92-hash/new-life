# Waybook

A self-hosted, AI-run text adventure. No build step, no backend required —
three static files that talk directly to the Anthropic API from the browser.

## Run it

Any static file server works. Simplest local option:

```bash
cd waybook
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in a browser (works in most browsers,
though some enforce stricter rules for local files — a real server is safer).

## Deploy it

Since it's plain HTML/CSS/JS, it runs on any static host: GitHub Pages,
Netlify, Vercel (as a static project, no framework needed), Cloudflare Pages,
an S3 bucket, or a folder on your own server.

## How it works

- `index.html` — the setup wizard (setting, character, party, quest, API key)
  and the game screen (story log + character dossier).
- `style.css` — the visual design.
- `app.js` — all the logic: builds a system prompt from what you entered in
  the wizard, calls the Anthropic Messages API for each turn, and parses a
  small `<state>{...}</state>` JSON block the model appends after its
  narration to update HP, inventory, and party status. That block is stripped
  before the story is shown.

## Randomizers

Two "roll for me" buttons sit at the top of the setup wizard:

- **🎲 Surprise me — UK / Australia story** — picks from 14 seeded adventure
  scenarios (mysteries, expeditions, noir, folklore) across the UK and
  Australia and fills in setting, character, quest, and starting items.
- **🎂 Life at 18 — random year, 1992–2026** — generates a coming-of-age
  scenario instead: a random UK or Australian town, a random year anywhere
  from 1992 to 2026, and a setting written with era-accurate flavour (mixtapes
  and pagers in the '90s, MSN and Nokias in the early 2000s, lockdown Zoom
  calls in 2020-22, and so on). Your character is always eighteen — you just
  fill in their name. The quest is drawn from a small pool of real
  coming-of-age situations (leaving home, a first job, patching things up
  with someone) rather than danger/mystery hooks.

Both are just starting points — edit any field afterward, or reroll as many
times as you like.

## History consolidation (keeping long games running smoothly)

Every turn sends the running conversation to the model so it has full
context. Left unchecked, that transcript grows forever and eventually pushes
against the model's context limit on a long adventure.

To avoid that, `app.js` now consolidates automatically: **every 3 player
turns**, it makes one extra lightweight API call asking the model to condense
everything that's happened so far into a short recap (under ~150 words). That
recap is stored in `state.summary`, the running `history` array is cleared,
and future turns carry the recap forward inside the system prompt (under
"STORY SO FAR") instead of resending the full transcript. You'll see a small
"— story so far condensed —" marker in the log each time this happens.

This is tunable: change `CONSOLIDATE_EVERY` near the top of `app.js` (default
`3`) to consolidate more or less often. Consolidation is best-effort — if that
extra API call fails for any reason, the game just keeps going with the full
transcript rather than losing your progress.

## About the API key

This app calls `api.anthropic.com` straight from the browser using the
`anthropic-dangerous-direct-browser-access` header, which is what makes a
no-backend deployment possible. That means:

- **Your key lives in this browser tab** (and in `localStorage` if you check
  "remember key"). Anyone with access to that browser/device can read it via
  dev tools.
- **Don't deploy this publicly with your key pre-filled**, and don't share a
  hosted link expecting others to safely use their own keys on a page you
  control unless you trust that hosting.
- Fine for personal, local, or trusted use. If you want this to be safely
  shareable with other people, the key needs to move server-side — swap the
  direct `fetch` calls in `app.js` for calls to your own small backend (a
  single serverless function that holds the key and proxies the request)
  instead of hitting `api.anthropic.com` from the client.

## Tuning the game

- **Pace / tone / turn length** — edit the rules in `buildSystemPrompt()` in
  `app.js`.
- **State tracked** — currently player HP, inventory, and per-companion HP.
  To track more (say, a relationship meter, gold, a map), add a field to the
  `<state>` JSON schema in the system prompt and handle it in `applyPatch()`.
- **Consolidation frequency** — `CONSOLIDATE_EVERY` in `app.js`.
- **Life-at-18 eras** — edit or extend the `LIFE_ERAS` array in `app.js` to
  add more specific years or swap in different regions.
- **Models** — the dropdown offers Sonnet 5, Opus 5, and Haiku 4.5. Swap the
  `<option>` values in `index.html` for any other model string your key has
  access to.

## Known limitations

- No image generation, no dice-roll mechanics beyond what the model narrates.
- Session (state + full history) is saved to `localStorage` on this device
  only — no accounts, no cross-device sync.
- History consolidation trims the raw transcript, but very long games will
  still eventually accumulate a long chain of recap paragraphs in
  `state.summary`. For extremely long-running games you'd want to also cap or
  re-summarize the summary itself.
