/* ===========================================================
   Waybook — a self-hosted, AI-run text adventure
   No build step. Talks directly to the Anthropic Messages API
   using a key the player supplies in the browser.
   =========================================================== */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "waybook_session_v1";
const KEY_STORAGE = "waybook_api_key";
const CONSOLIDATE_EVERY = 3; // summarize the running transcript after this many player turns

// ---------- Random adventure seeds (UK & Australia) ----------

const RANDOM_SEEDS = [
  {
    region: "UK",
    setting: "Whitby, on the Yorkshire coast, in the week the equinox tide drops low enough to expose the smugglers' tunnels under the abbey cliff — tunnels that haven't seen daylight since a bell went missing from the church above in 1901.",
    charName: "Rowan Ashcombe",
    charDesc: "A maritime archivist on sabbatical, more comfortable with shipping ledgers than people, who came to Whitby chasing a footnote about the missing bell and found the tide had other plans.",
    quest: "Find out what really happened to the church bell in 1901, and what's been keeping the tunnel mouth sealed ever since.",
    startItems: "brass lantern, tide almanac, a rubbing of the bell's old inscription",
  },
  {
    region: "UK",
    setting: "A crumbling manor on the Norfolk Fens, cut off by floodwater for the third winter running, where the tenant farmers swear something walks the causeway when the mist comes in.",
    charName: "Edith Marlowe",
    charDesc: "A folklore collector sent by a university that stopped funding her a year ago, still finishing the job on her own coin.",
    quest: "Record what's really happening on the causeway before the last farming family gives up the tenancy for good.",
    startItems: "wax cylinder recorder, oilskin notebook, a borrowed shotgun she's never fired",
  },
  {
    region: "UK",
    setting: "A Welsh mining valley the year after the pit closed, where the old union hall has been quietly reopened by someone nobody in the village will name.",
    charName: "Gethin Pryce",
    charDesc: "A laid-off surveyor who knows the tunnels under the valley better than anyone left alive, and owes the wrong person a favour.",
    quest: "Find out who reopened the union hall, and what they're using the old shafts for.",
    startItems: "pit lamp, hand-drawn tunnel survey, a union card that shouldn't still be valid",
  },
  {
    region: "UK",
    setting: "The Scottish Highlands during a stalking season gone wrong, where the estate's gamekeeper has vanished and the deer count doesn't add up.",
    charName: "Isla Fenwick",
    charDesc: "An apprentice stalker three seasons in, trusted with the rifle but not yet the secrets of the estate.",
    quest: "Find the missing gamekeeper before the estate's owner brings in outside help who won't ask the right questions.",
    startItems: "stalking rifle, estate map, a torn page from the gamekeeper's log",
  },
  {
    region: "UK",
    setting: "A 1920s smuggler's port on the Cornish coast, run by three rival families and one harbourmaster nobody has managed to buy.",
    charName: "Constance Trelawny",
    charDesc: "The harbourmaster's estranged daughter, back in town for a funeral and immediately mistaken for someone with far more leverage than she has.",
    quest: "Work out which family is behind the missing excise ledgers before the harbourmaster's death is ruled anything but natural.",
    startItems: "harbour keys, a ledger page torn free, a revolver that isn't loaded",
  },
  {
    region: "UK",
    setting: "An English cathedral city in the last week before a controversial restoration begins, when a mason's mark turns up in the crypt matching no known guild.",
    charName: "Peter Holloway",
    charDesc: "A conservation architect whose entire career is riding on this restoration going smoothly, which it is now very much not doing.",
    quest: "Identify the mark before the restoration board decides it's easier to simply plaster over the crypt.",
    startItems: "rubbing kit, cathedral floor plans, a set of borrowed crypt keys",
  },
  {
    region: "UK",
    setting: "A London Underground station, closed since the Blitz, that maintenance crews insist keeps reappearing on their tunnel maps despite being formally sealed decades ago.",
    charName: "Nadia Okonkwo",
    charDesc: "A transport authority engineer sent to close out a paperwork anomaly, who did not sign up for what she found in the ventilation shaft.",
    quest: "Work out why the station keeps showing up on the maps, and what's using it, before the anomaly reaches head office.",
    startItems: "hard hat with headlamp, 1940s station schematic, a two-way radio with patchy signal",
  },
  {
    region: "Australia",
    setting: "A mining claim in the Western Australian outback where the water table has started behaving like nothing the old survey charts predicted.",
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
  {
    region: "Australia",
    setting: "A remote sheep station in outback Queensland during the worst drought in a generation, where the station's bore water has started tasting of something nobody can name.",
    charName: "Bel Carrington",
    charDesc: "The station manager's daughter, home from agricultural college to help keep the place afloat, unwilling to admit how bad the season has actually gotten.",
    quest: "Work out what's fouling the bore before the last of the stock has to be sold off.",
    startItems: "water test kit, station ledger, ute keys",
  },
  {
    region: "Australia",
    setting: "A wilderness airstrip in Tasmania's south-west, weathered in for the third day running, where a bushwalking group radioed for help and then stopped answering entirely.",
    charName: "Ollie Tran",
    charDesc: "A volunteer search-and-rescue pilot with more hours flying this coastline than anyone else on the roster, grounded until the weather breaks.",
    quest: "Find the missing bushwalking group before the weather window closes for good.",
    startItems: "topographic map, emergency beacon receiver, a thermos that's gone cold",
  },
  {
    region: "Australia",
    setting: "A heritage pearling lugger moored off Broome at the start of the wet season, where the crew has found something in an oyster shell that isn't a pearl.",
    charName: "Yindi Walsh",
    charDesc: "A third-generation pearling deckhand who knows this water better than the charts do, and doesn't trust what just came up in the dredge.",
    quest: "Identify what's inside the shell before the lugger's owner decides to sell it to the first buyer who asks no questions.",
    startItems: "oyster knife, tide chart, a hessian sack with something heavy in it",
  },
  {
    region: "Australia",
    setting: "A gold-rush ghost town in regional Victoria, reopened as a heritage tourist site, where the restoration crew keeps finding the same grave freshly disturbed no matter how many times they fill it in.",
    charName: "Callum Reeve",
    charDesc: "A heritage-site caretaker two seasons into the job, whose predecessor left without giving notice or much of an explanation.",
    quest: "Work out who — or what — keeps disturbing the grave before the heritage trust pulls the site's funding over it.",
    startItems: "site keys, caretaker's logbook, a shovel that's seen too much use this month",
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

// ---------- "Life at 18" randomizer — real UK/Australia years, 1992-2026 ----------

// Era buckets give period-accurate flavour. Bucketed by decade-ish span,
// each with a UK detail, an Australia detail, and a short list of items
// an 18-year-old plausibly has on them that year.
const LIFE_ERAS = [
  {
    from: 1992, to: 1994,
    uk: "the last recession-shadowed years before Britpop breaks, Ceefax still the fastest way to check the football scores, and a landline is the only way anyone's reaching you tonight",
    au: "the tail end of a deep recession, cricket on the radio in the kitchen, and STD phone booths still doing steady trade outside the milk bar",
    items: "a Walkman with one good pair of headphones, a library card, a fiver that has to last the week",
  },
  {
    from: 1995, to: 1999,
    uk: "Britpop on every radio, a family computer that ties up the phone line whenever anyone dials up the internet, and a pager that only ever seems to go off at the worst moment",
    au: "the last summer before mobile phones are properly common, a share house with a shared dial-up connection, and cricket on in the background of everything",
    items: "a mixtape three friends contributed to, a pager, a crumpled TAB or bus ticket",
  },
  {
    from: 2000, to: 2004,
    uk: "the flat, uncertain years right after Y2K turned out to be nothing, a Nokia everyone can text on but nobody can afford to call from, and MSN Messenger as the real social life",
    au: "the Sydney Olympics still fresh in everyone's memory, a Nokia brick phone with a battery that lasts a week, and dial-up finally giving way to something faster",
    items: "a Nokia handset, a CD wallet, an EFTPOS card that's usually declined",
  },
  {
    from: 2005, to: 2008,
    uk: "MySpace giving way to Facebook, an iPod everyone's jealous of, and a part-time job that pays for a mobile plan and not much else",
    au: "the tail end of the mining boom's good mood, a first-gen Facebook account, and a P-plate stuck on the back of a car that's only sometimes reliable",
    items: "an iPod with a cracked screen protector, a set of house keys on a lanyard, a P-plate",
  },
  {
    from: 2009, to: 2012,
    uk: "the country still climbing out of the financial crisis, a first smartphone that's really just for texting and Facebook, and university fees that just went up and everyone's furious about it",
    au: "the aftermath of the GFC felt mostly through the news, a first smartphone with a data plan nobody quite understands, and a gap-year backpacking trip everyone's saving for",
    items: "an early smartphone, a student card, a half-finished job application",
  },
  {
    from: 2013, to: 2016,
    uk: "Instagram replacing Facebook as the thing that matters, zero-hour contracts as the going rate for a first job, and a referendum argument that's about to split every family dinner",
    au: "Instagram and share-house group chats, a casual hospitality job that never quite gives enough shifts, and a Centrelink queue that eats half a Tuesday",
    items: "a smartphone permanently at 20% battery, a share-house key, a payslip that's shorter than expected",
  },
  {
    from: 2017, to: 2019,
    uk: "gig-economy work as the default first job, a group chat that never stops buzzing, and a housing market that makes moving out feel like a joke",
    au: "gig-economy delivery work between uni units, a group chat that never stops buzzing, and share-house rent that keeps climbing every lease renewal",
    items: "a phone full of unread group-chat messages, a delivery-app login, a reusable coffee cup that's never actually washed",
  },
  {
    from: 2020, to: 2022,
    uk: "the strange flattened months of lockdowns and Zoom calls, a school leaving that never got its proper send-off, and a job market that's either frozen solid or suddenly desperate for anyone",
    au: "state border closures that cut whole families off from each other, a school formal cancelled twice, and a JobKeeper-era workplace that's either shut or unrecognisably busy",
    items: "a mask stuffed in a jacket pocket, a laptop that's seen a hundred video calls, a vaccination certificate on the phone",
  },
  {
    from: 2023, to: 2026,
    uk: "AI tools quietly doing half of everyone's coursework, a cost-of-living squeeze that makes every first payslip disappear fast, and a housing situation nobody under thirty finds funny",
    au: "AI tools showing up in every uni assignment brief, rent that's eaten the whole first payslip before it lands, and a share house found through a group chat rather than an agency",
    items: "a phone with more subscriptions than it can really afford, a share-house group chat pinned at the top, a half-used gift card",
  },
];

function eraFor(year) {
  return LIFE_ERAS.find((e) => year >= e.from && year <= e.to) || LIFE_ERAS[LIFE_ERAS.length - 1];
}

const LIFE_QUESTS = [
  "Decide what actually happens next now that school's behind you — and stop everyone else from deciding it for you.",
  "Get through the first week of a new job (or the job hunt for one) without the whole thing falling apart.",
  "Patch things up with a friend or family member before whatever's gone unsaid becomes permanent.",
  "Make it through a leaving party, a going-away, or a last night with everyone still together in one place.",
  "Work out whether to leave home, and whether the people you'd be leaving actually want you to.",
  "Sort out money, a room, or a plan for the next twelve months with almost nothing solid to build it on.",
];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function applyLifeSeed() {
  const region = Math.random() < 0.5 ? "UK" : "Australia";
  const year = randomInt(1992, 2026);
  const era = eraFor(year);
  const flavor = region === "UK" ? era.uk : era.au;
  const place = region === "UK"
    ? ["Manchester", "Cardiff", "Glasgow", "Bristol", "a small town outside Leeds", "a seaside town on the Kent coast"][randomInt(0, 5)]
    : ["Melbourne", "Perth", "Brisbane", "a coastal town in NSW", "regional Victoria", "a suburb of Adelaide"][randomInt(0, 5)];

  document.getElementById("setting").value =
    `${place}, ${year}. You've just turned eighteen, right in the middle of ${flavor}.`;
  document.getElementById("charName").value = "";
  document.getElementById("charDesc").value =
    `Eighteen years old as of this week, still figuring out who that actually makes you. Everyone around you seems to already have an opinion about what you do next.`;
  document.getElementById("quest").value = LIFE_QUESTS[randomInt(0, LIFE_QUESTS.length - 1)];
  document.getElementById("startItems").value = era.items;

  const note = document.getElementById("randomizeNote");
  note.textContent = `Loaded a ${region} story set in ${year} — you're eighteen. Fill in your name, then edit anything else, or roll again.`;
  note.hidden = false;
}

document.getElementById("lifeRandomizeBtn").addEventListener("click", applyLifeSeed);

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
    history: [{ role: "user"|"assistant", content: string }],  // running transcript sent to the API
    summary: string,          // condensed recap of everything consolidated out of `history` so far
    playerTurnCount: number,  // counts player actions, used to trigger consolidation
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
    summary: "",
    playerTurnCount: 0,
  };

  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  renderDossier();
  saveSession();

  requestTurn(buildOpeningPrompt(), { isOpening: true });
}

function buildSystemPrompt() {
  const recap = state.summary
    ? `\nSTORY SO FAR (condensed recap of everything before the messages below — treat it as established fact, don't re-narrate it): ${state.summary}\n`
    : "";

  return `You are the game master for a solo text adventure called "Waybook". Stay fully in character as narrator — never break the fiction, never mention that you are an AI.

SETTING: ${state.setting}

PLAYER CHARACTER: ${state.character.name} — ${state.character.desc}

PARTY: ${state.party.length ? state.party.map((p) => `${p.name} (${p.role})`).join(", ") : "traveling alone"}

QUEST: ${state.quest}
${recap}
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

  appendEntryForAction(playerActionText, opts.isOpening);
  state.history.push({ role: "user", content: playerActionText });

  const typingEl = appendTyping();

  try {
    const res = await callModel(state.history);
    const rawText = extractText(res);
    const { narration, patch } = parseTurn(rawText);

    state.history.push({ role: "assistant", content: rawText });

    typingEl.remove();
    appendEntry("gm", narration, patch);
    applyPatch(patch);
    renderDossier();

    if (patch.quest_complete) {
      appendEntry("system", "— The quest concludes here. Start a new expedition to continue. —");
      document.getElementById("actionInput").disabled = true;
      document.getElementById("sendBtn").disabled = true;
    }

    if (!opts.isOpening) {
      await maybeConsolidateHistory();
    }
    saveSession();
  } catch (err) {
    typingEl.remove();
    showGameError(err.message || "Something went wrong reaching the model.");
    state.history.pop(); // don't poison history with a failed turn
  } finally {
    setBusy(false);
  }
}

function appendEntryForAction(playerActionText, isOpening) {
  if (!isOpening) appendEntry("player", playerActionText);
}

async function callModel(messages, maxTokens = 700) {
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
      max_tokens: maxTokens,
      system: buildSystemPrompt(),
      messages,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

function extractText(data) {
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
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

// ---------- History consolidation ----------
// Every CONSOLIDATE_EVERY player turns, fold the running transcript into a
// short recap and clear it out of `history`, so the message list sent to the
// API each turn stays small no matter how long the adventure runs. The recap
// is carried forward inside the system prompt instead (see buildSystemPrompt).

async function maybeConsolidateHistory() {
  state.playerTurnCount = (state.playerTurnCount || 0) + 1;
  if (state.playerTurnCount % CONSOLIDATE_EVERY !== 0) return;
  if (state.history.length < 2) return;

  try {
    const summaryReq = [
      ...state.history,
      {
        role: "user",
        content:
          "Pause the story. In under 150 words, third person, present tense, summarize everything that's happened in this adventure so far: where the player is now, what's happened to them and their party, what they're carrying, and any unresolved threads. Do not invent new events. Do not include a <state> block — plain prose only.",
      },
    ];
    const res = await callModel(summaryReq, 300);
    const summaryText = extractText(res).trim();
    if (summaryText) {
      state.summary = state.summary ? `${state.summary}\n\n${summaryText}` : summaryText;
      state.history = [];
      appendEntry("system", "— story so far condensed to keep things running smoothly —");
    }
  } catch (e) {
    /* consolidation is best-effort — if it fails, the transcript just keeps growing normally */
  }
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
  if (state.summary) {
    appendEntry("system", "— story so far — " + state.summary);
  }
  (state.history || []).forEach((turn) => {
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
