# Waybook

A self-hosted, AI-run text adventure. No build step, no backend required —
three static files that talk directly to the Anthropic API from the browser.

## Run it

```bash
cd waybook
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly in a browser (a real server is a bit safer for
some browsers' local-file rules).

## Deploy it

Plain HTML/CSS/JS — runs on any static host: GitHub Pages, Netlify, Vercel
(as a static project), Cloudflare Pages, an S3 bucket, or your own server.

## Getting started

1. Paste in your Anthropic API key (and optionally check "remember key").
2. Click **🎲 New Adventure** or **🎂 New Life at 18** — either one rolls a
   full random setup (setting, character, quest, starting items and cash)
   and drops you straight into the story. No wizard, no extra steps.
3. Want full control instead? Click **Customize manually instead** to reveal
   a plain form for setting, character, party, quest, and starting items/HP/
   cash, then **Begin expedition**.

Once you're playing, the **🔁 New game** button in the sidebar ends the
current game and immediately rolls a fresh one (asks to confirm first, since
it clears your current progress).

## The two randomizers

- **🎲 New Adventure** — picks from 14 seeded scenarios (mysteries,
  expeditions, noir, folklore) across the UK and Australia.
- **🎂 New Life at 18** — a coming-of-age scenario instead: a random UK or
  Australian town, a random year anywhere from 1992 to 2026, and a setting
  written with era-accurate flavour (mixtapes and pagers in the '90s, MSN and
  Nokias in the early 2000s, lockdown Zoom calls in 2020–22, AI tools and a
  rent squeeze in 2023–26). Your character is always turning eighteen.

Both generate a random character name for you automatically.

## What the dossier tracks

- **HP** — a bar plus a number.
- **Cash** — a running total, spent/earned as the story calls for it.
- **Status** — short tags for temporary conditions (e.g. "soaked through",
  "wanted by the harbour police", "well-rested") that the game master adds
  and clears as the story moves.
- **Party** — companions and their HP, if you added any.
- **Inventory** — what you're carrying.

All of it is driven by a `<state>{...}</state>` JSON block the model appends
after each turn (hp/cash deltas, items and status gained/lost, party HP,
quest completion). That block is parsed and stripped before the story is
shown — you never see the raw JSON.

## Illustrations

Each turn, the model is also asked for a small illustration of the current
scene: a simple, flat SVG in the app's own colour palette, wrapped in
`<illustration>...</illustration>`. It's parsed out, sanity-checked (must be
a well-formed `<svg>`, no `<script>` tags or inline event handlers), and
rendered above that turn's narration. If a turn's SVG doesn't pass that
check, the illustration is just skipped for that turn — the story still
shows normally.

## Keeping long games running smoothly (history consolidation)

Every turn sends the running conversation to the model so it has context.
Left unchecked that transcript grows forever, so every **2 player turns**
(`CONSOLIDATE_EVERY` in `app.js`), the app makes one extra lightweight API
call asking the model to condense everything so far into a short recap
(under ~120 words). That recap is stored and carried forward inside the
system prompt ("STORY SO FAR"), the running transcript is cleared, and future
turns build on top of it instead of resending everything. You'll see a small
"— story so far condensed —" marker in the log each time this happens.

Lower `CONSOLIDATE_EVERY` further (e.g. to `1`) if you want it condensing
after every single turn; raise it if you'd rather keep more raw detail in
play longer. Consolidation is best-effort — if that extra call fails, the
game just keeps going with the full transcript rather than losing progress.

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
- Fine for personal, local, or trusted use. For something safely shareable
  with other people, move the key server-side — swap the direct `fetch`
  calls in `app.js` for calls to your own small backend instead of hitting
  `api.anthropic.com` from the client.

## Tuning

- **Pace / tone / turn length / illustration style** — edit
  `buildSystemPrompt()` in `app.js`.
- **State tracked** — extend the `<state>` JSON schema in the system prompt
  and handle new fields in `applyPatch()`.
- **Consolidation frequency** — `CONSOLIDATE_EVERY` in `app.js`.
- **Life-at-18 eras / places / quests** — `LIFE_ERAS`, `UK_PLACES`,
  `AU_PLACES`, `LIFE_QUESTS` in `app.js`.
- **Name pools** — `NAME_POOLS` in `app.js`.
- **Models** — the dropdown offers Sonnet 5, Opus 5, and Haiku 4.5. Swap the
  `<option>` values in `index.html` for any other model string your key has
  access to.

## Known limitations

- No dice-roll mechanics beyond what the model narrates; illustrations are
  simple SVG scene sketches, not detailed art.
- Session (state + history) saves to `localStorage` on this device only.
- Consolidation trims the raw transcript, but a very long game will still
  accumulate a long chain of recap paragraphs in `state.summary` over time —
  for extremely long-running games you'd want to periodically re-summarize
  the summary itself too.
