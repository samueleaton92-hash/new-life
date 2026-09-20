/* ===========================================================
   Waybook — a self-hosted, AI-run text adventure
   No build step. Talks directly to the Anthropic Messages API
   using a key the player supplies in the browser.
   =========================================================== */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "waybook_session_v1";
const KEY_STORAGE = "waybook_api_key";

// ---------- Random story seeds (UK & Australia) ----------

const RANDOM_SEEDS = [
  {
    region: "UK",
    setting: "Whitby, on the Yorkshire coast, in the week the equinox tide drops low enough to expose the smugglers' tunnels under the abbey cliff — tunnels that haven't seen daylight since a bell went missing from the church above in 1901.",
    charName: "Rowan Ashcombe",
    charDesc: "A maritime archivist on sabbatical, more comfortable with shipping ledgers than people, who came to Whitby chasing a footnote about the missing bell and found the tide had other plans.",
    quest: "Find out what really happened to the church bell in 1901, and what's been keeping the tunnel mouth sealed ever since.",
    startItems: "oil lantern, tide table, a rubbing of a worn inscription",
  },
  {
    region: "UK",
    setting: "A disused London Underground station, sealed since the Blitz, that a night-shift maintenance contract has just reopened for a structural survey — and the survey team keeps finding things that shouldn't still be down there.",
    charName: "Priya Nandwani",
    charDesc: "A structural engineer's assistant working her first solo night contract, methodical to a fault, who signed up for concrete readings and not much else.",
    quest: "Complete the survey — and work out who, or what, has been leaving fresh chalk marks on eighty-year-old platform tiles.",
    startItems: "hard hat torch, survey clipboard, a spare Oyster card",
  },
  {
    region: "UK",
    setting: "A single-track road in the Scottish Highlands, deep in a glen where a hillwalker vanished twenty years ago and was never found — until this week, when a shepherd found her boots on a ridge that hadn't been searched.",
    charName: "Euan Fraser",
    charDesc: "A mountain rescue volunteer who was on the original search two decades ago and has never quite let it go, back in the glen on his own time.",
    quest: "Follow the boots to whatever's left to find, and finally close the file on the walker who disappeared.",
    startItems: "OS map, headtorch, a photograph of the missing walker",
  },
  {
    region: "UK",
    setting: "A Welsh valley town built entirely around a colliery that closed thirty years ago, where the last two miles of tunnel were never mapped before they were sealed — and a subsidence survey has just cracked one open.",
    charName: "Bethan Pryce",
    charDesc: "A local council surveyor and the granddaughter of a man who never came up from the 1974 flood in that same shaft, sent to assess the new crack alone.",
    quest: "Get eyes on what's behind the subsidence before the council orders it resealed for good, and find out if the 1974 flood victims are really where the record says.",
    startItems: "gas monitor, hand-drawn family map of the old workings, work gloves",
  },
  {
    region: "UK",
    setting: "A tin-streaming coastline in Cornwall where erosion has just exposed the timber ribs of a wreck no local record accounts for, on a stretch of beach still known locally as Wreckers' Reach.",
    charName: "Demelza Trewin",
    charDesc: "A maritime archaeology postgrad, broke and behind on her thesis, who's supposed to be surveying kelp beds and can't stop thinking about the wreck instead.",
    quest: "Identify the wreck before the tide reburies it, and find out why nobody wanted it found the first time.",
    startItems: "trowel and brush kit, waterproof notebook, a borrowed metal detector",
  },
  {
    region: "UK",
    setting: "The sealed underground vaults beneath Edinburgh's Old Town, opened for one night to a heritage trust survey team, on the anniversary of a fire that supposedly killed everyone trapped down there in 1824.",
    charName: "Cammie Wark",
    charDesc: "A heritage trust intern doing unpaid hours for the CV line, armed with a torch and a laminated fact-sheet she doesn't fully believe.",
    quest: "Document the vaults for the trust's file — and find out whether the 1824 fire really killed everyone the record says it did.",
    startItems: "site torch, laminated vault map, walkie-talkie with a dying battery",
  },
  {
    region: "UK",
    setting: "A wet October in the Norfolk Fens, flat as a tabletop to the horizon, where a birdwatcher went out to the reed beds three days ago and hasn't been seen since — and the locals keep mentioning the old story of the Fen Tiger without quite laughing it off.",
    charName: "Ottilie Vance",
    charDesc: "A wildlife trust ranger who knows the reed beds better than anyone alive, called in when the search dogs lost the scent at the water's edge.",
    quest: "Find the missing birdwatcher before the weather turns, and decide for yourself what the Fen Tiger story is really about.",
    startItems: "waders, dog whistle, ordnance map of the fen channels",
  },
  {
    region: "Australia",
    setting: "An underground opal-mining town in the South Australian outback, where half the population lives below ground to escape the heat, and a rival claim dispute has just turned up a tunnel nobody registered.",
    charName: "Casey Mullane",
    charDesc: "A third-generation opal miner running her late father's claim on a shoestring, sharp-tongued and out of patience with the neighbouring claim's lawyers.",
    quest: "Work out who dug the unregistered tunnel and what it connects to before the dispute turns into something worse.",
    startItems: "miner's headlamp, hand pick, a folder of claim paperwork",
  },
  {
    region: "Australia",
    setting: "Old-growth wilderness in Tasmania, where a bushwalker went off-track eleven days ago near the ruins of a convict-era timber station that the maps still mark as unsurveyed.",
    charName: "Jarrah Coates",
    charDesc: "A Parks and Wildlife field officer, quiet and exacting, assigned the search after the volunteer parties turned back at the ruins.",
    quest: "Find the missing bushwalker, and find out why three separate search parties have all turned back at exactly the same ridge.",
    startItems: "topographic map, satellite phone, trail rations",
  },
  {
    region: "Australia",
    setting: "A remote research station on a Top End waterway in the Northern Territory, croc country, where a colleague's boat was found drifting empty two mornings ago with the outboard still running.",
    charName: "Nell Yunupingu-Barrett",
    charDesc: "A wetlands ecologist on a six-month posting, the only one on the team who actually grew up reading this particular stretch of water.",
    quest: "Work out what happened to the missing colleague before the wet season closes the station's only road out.",
    startItems: "two-way radio, tide chart, a battered pair of binoculars",
  },
  {
    region: "Australia",
    setting: "Sydney Harbour after dark, where a decommissioned naval tunnel under Cockatoo Island has been reopened for heritage tours — and the harbourmaster's office has just quietly reported a container gone missing from the wrong side of a locked gate.",
    charName: "Theo Marchetti",
    charDesc: "A former customs officer now working harbour heritage security, still sharper than the job strictly requires, and annoyed at being taken off real cases for tour-guide duty.",
    quest: "Find the missing container and work out who had gate access before the harbourmaster's office buries the whole thing.",
    startItems: "site access badge, torch, a printed manifest with one line crossed out",
  },
  {
    region: "Australia",
    setting: "A near-abandoned goldfields town in Western Australia, kept alive by one pub and a skeleton population, where a decades-dry mine shaft has just started flooding from a source nobody can locate.",
    charName: "Reg Halloran",
    charDesc: "The town's last licensed prospector, more used to reading rock than people, roped into helping the shire council figure out where the water's coming from.",
    quest: "Trace the flooding to its source before it swallows what's left of the old workings — and the town's water table with it.",
    startItems: "hand-cranked water pump gauge, old mine survey chart, hip flask",
  },
  {
    region: "Australia",
    setting: "A marine research vessel anchored off the Great Barrier Reef, mid-survey on a bleaching event, when the dive team pulls up something from a wreck site that isn't in any of the charts.",
    charName: "Mackenzie Ilott",
    charDesc: "A marine biologist three years into a coral-decline study, more at home underwater than on deck, whose funding depends on this trip going smoothly.",
    quest: "Identify what the dive team found before the ship's owner decides it's not worth the delay to the survey schedule.",
    startItems: "dive logbook, underwater camera, a sample vial with no label",
  },
  {
    region: "Australia",
    setting: "Melbourne's laneways in the winter of 1948, all wet cobblestone and tram bells, where a jazz club owner has gone missing along with a ledger that several very interested parties would like back.",
    charName: "Frankie Doyle",
    charDesc: "A demobbed private investigator working out of a one-room office above a milk bar, three weeks behind on rent and not fussy about clients.",
    quest: "Find the missing ledger — and the club owner — before whoever wants it back stops asking nicely.",
    startItems: "notebook and pencil, a spare set of skeleton keys, half a packet of cigarettes",
  },
];

function applyRandomSeed() {
  const seed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)];
  document.getElementById("setting").value = seed.setting;
  document.getElementById("charName").value = seed.charName;
  document.getElementById("charDesc").value = seed.charDesc;
  document.getElementById("quest").value = seed.quest;
  document.getElementById("startItems").value = seed.startItems;

  const note = document.getElementById("randomizeNote");
  note.textContent = `Loaded a ${seed.region} story — steps 2 to 5 are filled in. Edit anything, or roll again.`;
  note.hidden = false;
}

document.getElementById("randomizeBtn").addEventListener("click", applyRandomSeed);

// ---------- Setup wizard state ----------

const steps = Array.from(document.querySelectorAll(".step"));
let currentStep = 0;
let party = []; // [{ id, name, role, hp }]

const stepper = document.getElementById("stepper");
steps.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.className = "dot";
  stepper.appendChild(dot);
});

function renderStepper() {
  const dots = stepper.querySelectorAll(".dot");
  dots.forEach((d, i) => {
    d.classList.toggle("active", i === currentStep);
    d.classList.toggle("done", i < currentStep);
  });
}

function showStep(i) {
  steps.forEach((s, idx) => (s.hidden = idx !== i));
  document.getElementById("prevStep").hidden = i === 0;
  document.getElementById("nextStep").textContent =
    i === steps.length - 1 ? "Begin expedition" : "Continue";
  renderStepper();
}

function fieldValue(id) {
  return document.getElementById(id).value.trim();
}

function validateStep(i) {
  const err = document.getElementById("setupError");
  err.hidden = true;
  if (i === 0 && !fieldValue("apiKey")) {
    err.textContent = "An API key is needed to run the game master.";
    err.hidden = false;
    return false;
  }
  if (i === 1 && !fieldValue("setting")) {
    err.textContent = "Give the game master a setting to work with.";
    err.hidden = false;
    return false;
  }
  if (i === 2 && (!fieldValue("charName") || !fieldValue("charDesc"))) {
    err.textContent = "Your character needs a name and a description.";
    err.hidden = false;
    return false;
  }
  if (i === 4 && !fieldValue("quest")) {
    err.textContent = "What's the quest? Even a vague one works.";
    err.hidden = false;
    return false;
  }
  return true;
}

document.getElementById("nextStep").addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  } else {
    startGame();
  }
});

document.getElementById("prevStep").addEventListener("click", () => {
  currentStep = Math.max(0, currentStep - 1);
  showStep(currentStep);
});

// Setting quick-fill chips
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const targetId = chip.closest(".chip-row").dataset.fillTarget;
    document.getElementById(targetId).value = chip.dataset.value;
  });
});

// Party roster builder
let partyRowId = 0;
document.getElementById("addPartyMember").addEventListener("click", () => addPartyRow());

function addPartyRow(name = "", role = "") {
  const id = "p" + partyRowId++;
  const row = document.createElement("div");
  row.className = "party-row";
  row.dataset.id = id;
  row.innerHTML = `
    <input type="text" class="party-name" placeholder="Name" value="${escapeAttr(name)}">
    <input type="text" class="party-role" placeholder="Role (e.g. medic, thief)" value="${escapeAttr(role)}">
    <button type="button" class="remove-btn" aria-label="Remove companion">&times;</button>
  `;
  row.querySelector(".remove-btn").addEventListener("click", () => row.remove());
  document.getElementById("partyList").appendChild(row);
}

function escapeAttr(s) {
  return s.replace(/"/g, "&quot;");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// restore remembered key
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(KEY_STORAGE);
  if (saved) {
    document.getElementById("apiKey").value = saved;
    document.getElementById("rememberKey").checked = true;
  }
  showStep(0);
});

// ---------- Game state ----------

let state = null; // built on startGame(); see shape below
/*
  state = {
    model, apiKey,
    setting, quest,
    character: { name, desc, hp, maxHp },
    party: [{ name, role, hp, maxHp }],
    inventory: [string],
    history: [{ role: "user"|"assistant", content: string }]  // sent to API
  }
*/

function startGame() {
  const apiKey = fieldValue("apiKey");
  if (document.getElementById("rememberKey").checked) {
    localStorage.setItem(KEY_STORAGE, apiKey);
  } else {
    localStorage.removeItem(KEY_STORAGE);
  }

  document.querySelectorAll(".party-row").forEach((row) => {
    const name = row.querySelector(".party-name").value.trim();
    const role = row.querySelector(".party-role").value.trim();
    if (name) party.push({ name, role: role || "companion", hp: 15, maxHp: 15 });
  });

  const startHp = parseInt(fieldValue("startHp") || "20", 10);
  const startItems = fieldValue("startItems")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  state = {
    model: document.getElementById("model").value,
    apiKey,
    setting: fieldValue("setting"),
    quest: fieldValue("quest"),
    character: {
      name: fieldValue("charName"),
      desc: fieldValue("charDesc"),
      hp: startHp,
      maxHp: startHp,
    },
    party,
    inventory: startItems,
    history: [],
  };

  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  renderDossier();
  saveSession();

  requestTurn(buildOpeningPrompt(), { isOpening: true });
}

function buildSystemPrompt() {
  return `You are the game master for a solo text adventure called "Waybook". Stay fully in character as narrator — never break the fiction, never mention that you are an AI.

SETTING: ${state.setting}

PLAYER CHARACTER: ${state.character.name} — ${state.character.desc}

PARTY: ${state.party.length ? state.party.map((p) => `${p.name} (${p.role})`).join(", ") : "traveling alone"}

QUEST: ${state.quest}

Rules for your narration:
- Write vivid, concrete, second-person narration ("You..."), 120-220 words per turn.
- Give the player real agency: end most turns with a situation that invites a choice, not a direct question.
- Respect danger. Let actions fail or cost something when that's the honest outcome. Don't railroad; adapt to what the player actually tried.
- Track consequences — injuries, items found or lost, party members hurt or helped — using the state block below.
- Never resolve the whole quest in one turn. Pace it like a real campaign.

After your narration, on its own final line, output exactly one machine-readable state block reflecting what changed THIS turn only (use 0 / empty values if nothing changed):
<state>{"hp_delta": 0, "items_gained": [], "items_lost": [], "party_hp_deltas": {}, "quest_complete": false}</state>

Do not explain the state block or refer to it in the narration. Do not wrap it in markdown code fences.`;
}

function buildOpeningPrompt() {
  return `Begin the adventure. Set the opening scene: establish the world, drop the player into their first concrete situation, and give them a reason to act right now. Do not resolve anything about the quest yet.`;
}

// ---------- API calls ----------

async function requestTurn(playerActionText, opts = {}) {
  setBusy(true);
  hideGameError();

  if (!opts.isOpening) {
    appendEntry("player", playerActionText);
    state.history.push({ role: "user", content: playerActionText });
  } else {
    state.history.push({ role: "user", content: playerActionText });
  }

  const typingEl = appendTyping();

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": state.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: state.model,
        max_tokens: 700,
        system: buildSystemPrompt(),
        messages: state.history,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Request failed (${res.status})`);
    }

    const data = await res.json();
    const rawText = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const { narration, patch } = parseTurn(rawText);

    state.history.push({ role: "assistant", content: rawText });

    typingEl.remove();
    appendEntry("gm", narration, patch);
    applyPatch(patch);
    renderDossier();
    saveSession();

    if (patch.quest_complete) {
      appendEntry("system", "— The quest concludes here. Start a new expedition to continue. —");
      document.getElementById("actionInput").disabled = true;
      document.getElementById("sendBtn").disabled = true;
    }
  } catch (err) {
    typingEl.remove();
    showGameError(err.message || "Something went wrong reaching the model.");
    state.history.pop(); // don't poison history with a failed turn
  } finally {
    setBusy(false);
  }
}

function parseTurn(rawText) {
  const match = rawText.match(/<state>([\s\S]*?)<\/state>/);
  let patch = { hp_delta: 0, items_gained: [], items_lost: [], party_hp_deltas: {}, quest_complete: false };
  if (match) {
    try {
      patch = { ...patch, ...JSON.parse(match[1]) };
    } catch (e) {
      /* malformed state block — narration still shows, patch stays neutral */
    }
  }
  const narration = rawText.replace(/<state>[\s\S]*?<\/state>/, "").trim();
  return { narration, patch };
}

function applyPatch(patch) {
  if (patch.hp_delta) {
    state.character.hp = clamp(state.character.hp + patch.hp_delta, 0, state.character.maxHp);
  }
  (patch.items_gained || []).forEach((item) => {
    if (item && !state.inventory.includes(item)) state.inventory.push(item);
  });
  (patch.items_lost || []).forEach((item) => {
    state.inventory = state.inventory.filter((i) => i !== item);
  });
  if (patch.party_hp_deltas) {
    Object.entries(patch.party_hp_deltas).forEach(([name, delta]) => {
      const member = state.party.find((p) => p.name === name);
      if (member) member.hp = clamp(member.hp + delta, 0, member.maxHp);
    });
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// ---------- Rendering ----------

function appendEntry(kind, text, patch) {
  const log = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = `entry entry-${kind}`;

  if (kind === "gm") {
    text.split(/\n{2,}/).forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para;
      entry.appendChild(p);
    });
    if (patch) {
      const notes = summarizePatch(patch);
      notes.forEach((n) => {
        const tag = document.createElement("span");
        tag.className = `state-note ${n.type}`;
        tag.textContent = n.text;
        entry.appendChild(tag);
      });
    }
  } else if (kind === "player") {
    const p = document.createElement("p");
    p.textContent = "→ " + text;
    entry.appendChild(p);
  } else {
    entry.textContent = text;
  }

  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function summarizePatch(patch) {
  const notes = [];
  if (patch.hp_delta > 0) notes.push({ type: "gain", text: `+${patch.hp_delta} HP` });
  if (patch.hp_delta < 0) notes.push({ type: "loss", text: `${patch.hp_delta} HP` });
  (patch.items_gained || []).forEach((i) => notes.push({ type: "gain", text: `+ ${i}` }));
  (patch.items_lost || []).forEach((i) => notes.push({ type: "loss", text: `− ${i}` }));
  Object.entries(patch.party_hp_deltas || {}).forEach(([name, d]) => {
    if (d) notes.push({ type: d > 0 ? "gain" : "loss", text: `${name} ${d > 0 ? "+" : ""}${d} HP` });
  });
  return notes;
}

function appendTyping() {
  const log = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = "entry entry-gm";
  entry.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  return entry;
}

function renderDossier() {
  document.getElementById("dChar").textContent = state.character.name;
  document.getElementById("dQuest").textContent = state.quest;

  const pct = (state.character.hp / state.character.maxHp) * 100;
  const fill = document.getElementById("hpFill");
  fill.style.width = pct + "%";
  fill.className = "hp-fill" + (pct <= 25 ? " danger" : pct <= 55 ? " warn" : "");
  document.getElementById("hpText").textContent = `${state.character.hp} / ${state.character.maxHp}`;

  const roster = document.getElementById("partyRoster");
  roster.innerHTML = "";
  if (!state.party.length) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="role">Traveling alone</span>`;
    roster.appendChild(li);
  } else {
    state.party.forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${escapeHtml(p.name)} <span class="role">${escapeHtml(p.role)}</span></span><span class="php">${p.hp}/${p.maxHp}</span>`;
      roster.appendChild(li);
    });
  }

  const inv = document.getElementById("inventory");
  inv.innerHTML = "";
  state.inventory.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    inv.appendChild(li);
  });
}

function setBusy(busy) {
  document.getElementById("actionInput").disabled = busy;
  document.getElementById("sendBtn").disabled = busy;
  document.getElementById("sendBtn").textContent = busy ? "…" : "Act";
}

function showGameError(msg) {
  const el = document.getElementById("gameError");
  el.textContent = msg;
  el.hidden = false;
}
function hideGameError() {
  document.getElementById("gameError").hidden = true;
}

// ---------- Input handling ----------

document.getElementById("actionForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("actionInput");
  const text = input.value.trim();
  if (!text || !state) return;
  input.value = "";
  requestTurn(text);
});

document.getElementById("restartBtn").addEventListener("click", () => {
  if (!confirm("End this expedition? Your progress here will be cleared.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

// ---------- Session persistence (survive a refresh) ----------

function saveSession() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage full or unavailable — session just won't survive a refresh */
  }
}

function tryRestoreSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    state = JSON.parse(raw);
  } catch (e) {
    return false;
  }
  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  renderDossier();

  const log = document.getElementById("log");
  log.innerHTML = "";
  state.history.forEach((turn) => {
    if (turn.role === "user") {
      // skip re-rendering the opening prompt itself
      if (turn.content.startsWith("Begin the adventure")) return;
      appendEntry("player", turn.content);
    } else {
      const { narration } = parseTurn(turn.content);
      appendEntry("gm", narration);
    }
  });
  return true;
}

if (!tryRestoreSession()) {
  // setup wizard already visible by default
}
