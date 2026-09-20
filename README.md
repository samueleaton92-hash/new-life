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

Each turn sends the full running conversation as `messages`, with the world,
character, and quest baked into the `system` prompt — so the model always has
full context without you managing embeddings or a database.

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
  direct `fetch` in `app.js` for a call to your own small backend (a single
  serverless function that holds the key and proxies the request) instead of
  hitting `api.anthropic.com` from the client.

## Tuning the game

- **Pace / tone / turn length** — edit the rules in `buildSystemPrompt()` in
  `app.js`.
- **State tracked** — currently player HP, inventory, and per-companion HP.
  To track more (say, a relationship meter, gold, a map), add a field to the
  `<state>` JSON schema in the system prompt and handle it in `applyPatch()`.
- **Models** — the dropdown offers Sonnet 5, Opus 5, and Haiku 4.5. Swap the
  `<option>` values in `index.html` for any other model string your key has
  access to.

## Known limitations

- No image generation, no dice-roll mechanics beyond what the model narrates.
- Session (state + full history) is saved to `localStorage` on this device
  only — no accounts, no cross-device sync.
- Very long adventures will eventually push the conversation history toward
  the model's context limit. For a longer-running game, you'd want to
  periodically summarize older turns instead of sending the full transcript.
