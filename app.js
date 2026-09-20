/* ===========================================================
   Waybook — a self-hosted, AI-run text adventure
   No build step. Talks directly to the Anthropic Messages API
   using a key the player supplies in the browser.
   =========================================================== */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "waybook_session_v1";
const KEY_STORAGE = "waybook_api_key";
const CONSOLIDATE_EVERY = 2; // summarize the running transcript after this many player turns

// ---------- Name pools (used by both quick-start randomizers) ----------

const NAME_POOLS = {
  UK: {
    first: ["Rowan", "Edith", "Gethin", "Isla", "Constance", "Peter", "Nadia", "Mireille", "Declan", "Freya", "Osian", "Bronwyn"],
    last: ["Ashcombe", "Marlowe", "Pryce", "Fenwick", "Trelawny", "Holloway", "Okonkwo", "Auberon", "Whitlock", "Carrow"],
  },
  Australia: {
    first: ["Reg", "Mackenzie", "Frankie", "Bel", "Ollie", "Yindi", "Callum", "Dev", "Tilly", "Jarrah", "Nyah", "Cooper"],
    last: ["Halloran", "Ilott", "Doyle", "Carrington", "Tran", "Walsh", "Reeve", "Petrakis", "Ngata", "Fairweather"],
  },
};

function randomName(region) {
  const pool = NAME_POOLS[region] || NAME_POOLS.UK;
  return `${pool.first[randomInt(0, pool.first.length - 1)]} ${pool.last[randomInt(0, pool.last.length - 1)]}`;
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// ---------- Random adventure seeds (UK & Australia) ----------

const RANDOM_SEEDS = [
  {
    region: "UK",
    setting: "Whitby, on the Yorkshire coast, in the week the equinox tide drops low enough to expose the smugglers' tunnels under the abbey cliff — tunnels that haven't seen daylight since a bell went missing from the church above in 1901.",
    charDesc: "A maritime archivist on sabbatical, more comfortable with shipping ledgers than people, who came to Whitby chasing a footnote about the missing bell and found the tide had other plans.",
    quest: "Find out what really happened to the church bell in 1901, and what's been keeping the tunnel mouth sealed ever since.",
    startItems: "brass lantern, tide almanac, a rubbing of the bell's old inscription",
    cash: 40,
  },
  {
    region: "UK",
    setting: "A crumbling manor on the Norfolk Fens, cut off by floodwater for the third winter running, where the tenant farmers swear something walks the causeway when the mist comes in.",
    charDesc: "A folklore collector sent by a university that stopped funding her a year ago, still finishing the job on her own coin.",
    quest: "Record what's really happening on the causeway before the last farming family gives up the tenancy for good.",
    startItems: "wax cylinder recorder, oilskin notebook, a borrowed shotgun she's never fired",
    cash: 15,
  },
  {
    region: "UK",
    setting: "A Welsh mining valley the year after the pit closed, where the old union hall has been quietly reopened by someone nobody in the village will name.",
    charDesc: "A laid-off surveyor who knows the tunnels under the valley better than anyone left alive, and owes the wrong person a favour.",
    quest: "Find out who reopened the union hall, and what they're using the old shafts for.",
    startItems: "pit lamp, hand-drawn tunnel survey, a union card that shouldn't still be valid",
    cash: 8,
  },
  {
    region: "UK",
    setting: "The Scottish Highlands during a stalking season gone wrong, where the estate's gamekeeper has vanished and the deer count doesn't add up.",
    charDesc: "An apprentice stalker three seasons in, trusted with the rifle but not yet the secrets of the estate.",
    quest: "Find the missing gamekeeper before the estate's owner brings in outside help who won't ask the right questions.",
    startItems: "stalking rifle, estate map, a torn page from the gamekeeper's log",
    cash: 12,
  },
  {
    region: "UK",
    setting: "A 1920s smuggler's port on the Cornish coast, run by three rival families and one harbourmaster nobody has managed to buy.",
    charDesc: "The harbourmaster's estranged daughter, back in town for a funeral and immediately mistaken for someone with far more leverage than she has.",
    quest: "Work out which family is behind the missing excise ledgers before the harbourmaster's death is ruled anything but natural.",
    startItems: "harbour keys, a ledger page torn free, a revolver that isn't loaded",
    cash: 25,
  },
  {
    region: "UK",
    setting: "An English cathedral city in the last week before a controversial restoration begins, when a mason's mark turns up in the crypt matching no known guild.",
    charDesc: "A conservation architect whose entire career is riding on this restoration going smoothly, which it is now very much not doing.",
    quest: "Identify the mark before the restoration board decides it's easier to simply plaster over the crypt.",
    startItems: "rubbing kit, cathedral floor plans, a set of borrowed crypt keys",
    cash: 60,
  },
  {
    region: "UK",
    setting: "A London Underground station, closed since the Blitz, that maintenance crews insist keeps reappearing on their tunnel maps despite being formally sealed decades ago.",
    charDesc: "A transport authority engineer sent to close out a paperwork anomaly, who did not sign up for what she found in the ventilation shaft.",
    quest: "Work out why the station keeps showing up on the maps, and what's using it, before the anomaly reaches head office.",
    startItems: "hard hat with headlamp, 1940s station schematic, a two-way radio with patchy signal",
    cash: 30,
  },
  {
    region: "Australia",
    setting: "A mining claim in the Western Australian outback where the water table has started behaving like nothing the old survey charts predicted.",
    charDesc: "The town's last licensed prospector, more used to reading rock than people, roped into helping the shire council figure out where the water's coming from.",
    quest: "Trace the flooding to its source before it swallows what's left of the old workings — and the town's water table with it.",
    startItems: "hand-cranked water pump gauge, old mine survey chart, hip flask",
    cash: 20,
  },
  {
    region: "Australia",
    setting: "A marine research vessel anchored off the Great Barrier Reef, mid-survey on a bleaching event, when the dive team pulls up something from a wreck site that isn't in any of the charts.",
    charDesc: "A marine biologist three years into a coral-decline study, more at home underwater than on deck, whose funding depends on this trip going smoothly.",
    quest: "Identify what the dive team found before the ship's owner decides it's not worth the delay to the survey schedule.",
    startItems: "dive logbook, underwater camera, a sample vial with no label",
    cash: 45,
  },
  {
    region: "Australia",
    setting: "Melbourne's laneways in the winter of 1948, all wet cobblestone and tram bells, where a jazz club owner has gone missing along with a ledger that several very interested parties would like back.",
    charDesc: "A demobbed private investigator working out of a one-room office above a milk bar, three weeks behind on rent and not fussy about clients.",
    quest: "Find the missing ledger — and the club owner — before whoever wants it back stops asking nicely.",
    startItems: "notebook and pencil, a spare set of skeleton keys, half a packet of cigarettes",
    cash: 6,
  },
  {
    region: "Australia",
    setting: "A remote sheep station in outback Queensland during the worst drought in a generation, where the station's bore water has started tasting of something nobody can name.",
    charDesc: "The station manager's daughter, home from agricultural college to help keep the place afloat, unwilling to admit how bad the season has actually gotten.",
    quest: "Work out what's fouling the bore before the last of the stock has to be sold off.",
    startItems: "water test kit, station ledger, ute keys",
    cash: 18,
  },
  {
    region: "Australia",
    setting: "A wilderness airstrip in Tasmania's south-west, weathered in for the third day running, where a bushwalking group radioed for help and then stopped answering entirely.",
    charDesc: "A volunteer search-and-rescue pilot with more hours flying this coastline than anyone else on the roster, grounded until the weather breaks.",
    quest: "Find the missing bushwalking group before the weather window closes for good.",
    startItems: "topographic map, emergency beacon receiver, a thermos that's gone cold",
    cash: 35,
  },
  {
    region: "Australia",
    setting: "A heritage pearling lugger moored off Broome at the start of the wet season, where the crew has found something in an oyster shell that isn't a pearl.",
    charDesc: "A third-generation pearling deckhand who knows this water better than the charts do, and doesn't trust what just came up in the dredge.",
    quest: "Identify what's inside the shell before the lugger's owner decides to sell it to the first buyer who asks no questions.",
    startItems: "oyster knife, tide chart, a hessian sack with something heavy in it",
    cash: 10,
  },
  {
    region: "Australia",
    setting: "A gold-rush ghost town in regional Victoria, reopened as a heritage tourist site, where the restoration crew keeps finding the same grave freshly disturbed no matter how many times they fill it in.",
    charDesc: "A heritage-site caretaker two seasons into the job, whose predecessor left without giving notice or much of an explanation.",
    quest: "Work out who — or what — keeps disturbing the grave before the heritage trust pulls the site's funding over it.",
    startItems: "site keys, caretaker's logbook, a shovel that's seen too much use this month",
    cash: 22,
  },
];

// ---------- "Life at 18" randomizer — real UK/Australia years, 1992-2026 ----------

const LIFE_ERAS = [
  {
    from: 1992, to: 1994,
    uk: "the last recession-shadowed years before Britpop breaks, Ceefax still the fastest way to check the football scores, and a landline is the only way anyone's reaching you tonight",
    au: "the tail end of a deep recession, cricket on the radio in the kitchen, and STD phone booths still doing steady trade outside the milk bar",
    items: "a Walkman with one good pair of headphones, a library card, a fiver that has to last the week",
    cash: 5,
  },
  {
    from: 1995, to: 1999,
    uk: "Britpop on every radio, a family computer that ties up the phone line whenever anyone dials up the internet, and a pager that only ever seems to go off at the worst moment",
    au: "the last summer before mobile phones are properly common, a share house with a shared dial-up connection, and cricket on in the background of everything",
    items: "a mixtape three friends contributed to, a pager, a crumpled bus ticket",
    cash: 10,
  },
  {
    from: 2000, to: 2004,
    uk: "the flat, uncertain years right after Y2K turned out to be nothing, a Nokia everyone can text on but nobody can afford to call from, and MSN Messenger as the real social life",
    au: "the Sydney Olympics still fresh in everyone's memory, a Nokia brick phone with a battery that lasts a week, and dial-up finally giving way to something faster",
    items: "a Nokia handset, a CD wallet, an EFTPOS card that's usually declined",
    cash: 20,
  },
  {
    from: 2005, to: 2008,
    uk: "MySpace giving way to Facebook, an iPod everyone's jealous of, and a part-time job that pays for a mobile plan and not much else",
    au: "the tail end of the mining boom's good mood, a first-gen Facebook account, and a P-plate stuck on the back of a car that's only sometimes reliable",
    items: "an iPod with a cracked screen protector, a set of house keys on a lanyard, a P-plate",
    cash: 30,
  },
  {
    from: 2009, to: 2012,
    uk: "the country still climbing out of the financial crisis, a first smartphone that's really just for texting and Facebook, and university fees that just went up and everyone's furious about it",
    au: "the aftermath of the GFC felt mostly through the news, a first smartphone with a data plan nobody quite understands, and a gap-year backpacking trip everyone's saving for",
    items: "an early smartphone, a student card, a half-finished job application",
    cash: 25,
  },
  {
    from: 2013, to: 2016,
    uk: "Instagram replacing Facebook as the thing that matters, zero-hour contracts as the going rate for a first job, and a referendum argument that's about to split every family dinner",
    au: "Instagram and share-house group chats, a casual hospitality job that never quite gives enough shifts, and a Centrelink queue that eats half a Tuesday",
    items: "a smartphone permanently at 20% battery, a share-house key, a payslip that's shorter than expected",
    cash: 35,
  },
  {
    from: 2017, to: 2019,
    uk: "gig-economy work as the default first job, a group chat that never stops buzzing, and a housing market that makes moving out feel like a joke",
    au: "gig-economy delivery work between uni units, a group chat that never stops buzzing, and share-house rent that keeps climbing every lease renewal",
    items: "a phone full of unread group-chat messages, a delivery-app login, a reusable coffee cup that's never actually washed",
    cash: 40,
  },
  {
    from: 2020, to: 2022,
    uk: "the strange flattened months of lockdowns and Zoom calls, a school leaving that never got its proper send-off, and a job market that's either frozen solid or suddenly desperate for anyone",
    au: "state border closures that cut whole families off from each other, a school formal cancelled twice, and a JobKeeper-era workplace that's either shut or unrecognisably busy",
    items: "a mask stuffed in a jacket pocket, a laptop that's seen a hundred video calls, a vaccination certificate on the phone",
    cash: 45,
  },
  {
    from: 2023, to: 2026,
    uk: "AI tools quietly doing half of everyone's coursework, a cost-of-living squeeze that makes every first payslip disappear fast, and a housing situation nobody under thirty finds funny",
    au: "AI tools showing up in every uni assignment brief, rent that's eaten the whole first payslip before it lands, and a share house found through a group chat rather than an agency",
    items: "a phone with more subscriptions than it can really afford, a share-house group chat pinned at the top, a half-used gift card",
    cash: 50,
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

const UK_PLACES = ["Manchester", "Cardiff", "Glasgow", "Bristol", "a small town outside Leeds", "a seaside town on the Kent coast"];
const AU_PLACES = ["Melbourne", "Perth", "Brisbane", "a coastal town in NSW", "regional Victoria", "a suburb of Adelaide"];

function buildLifeSeed() {
  const region = Math.random() < 0.5 ? "UK" : "Australia";
  const year = randomInt(1992, 2026);
  const era = eraFor(year);
  const flavor = region === "UK" ? era.uk : era.au;
  const place = (region === "UK" ? UK_PLACES : AU_PLACES)[randomInt(0, 5)];

  return {
    region,
    setting: `${place}, ${year}. You've just turned eighteen, right in the middle of ${flavor}.`,
    charDesc: "Eighteen years old as of this week, still figuring out who that actually makes you. Everyone around you seems to already have an opinion about what you do next.",
    quest: LIFE_QUESTS[randomInt(0, LIFE_QUESTS.length - 1)],
    startItems: era.items,
    cash: era.cash,
    noteYear: year,
  };
}

// ---------- Setup: quick start & manual customize ----------

let party = []; // [{ name, role }] — reset at the start of every new game

function fieldValue(id) {
  return document.getElementById(id).value.trim();
}

function showSetupError(msg) {
  const err = document.getElementById("setupError");
  err.textContent = msg;
  err.hidden = false;
}
function hideSetupError() {
  document.getElementById("setupError").hidden = true;
}

function fillFormFromSeed(seed, charName) {
  document.getElementById("setting").value = seed.setting;
  document.getElementById("charName").value = charName;
  document.getElementById("charDesc").value = seed.charDesc;
  document.getElementById("quest").value = seed.quest;
  document.getElementById("startItems").value = seed.startItems;
  document.getElementById("startCash").value = seed.cash;
  document.getElementById("startHp").value = 20;
}

function quickStart(kind) {
  hideSetupError();
  if (!fieldValue("apiKey")) {
    showSetupError("Add your API key above first — that's what runs the game master.");
    document.getElementById("apiKey").focus();
    return;
  }

  const seed = kind === "life"
    ? buildLifeSeed()
    : RANDOM_SEEDS[randomInt(0, RANDOM_SEEDS.length - 1)];
  const charName = randomName(seed.region === "Australia" ? "Australia" : "UK");

  fillFormFromSeed(seed, charName);
  party = [];
  clearPartyRows();

  startGame();
}

document.getElementById("newAdventureBtn").addEventListener("click", () => quickStart("adventure"));
document.getElementById("newLifeBtn").addEventListener("click", () => quickStart("life"));

document.getElementById("customizeToggle").addEventListener("click", () => {
  const form = document.getElementById("customizeForm");
  form.hidden = !form.hidden;
  document.getElementById("customizeToggle").textContent = form.hidden
    ? "Customize manually instead"
    : "Hide manual customize";
});

document.getElementById("beginCustomBtn").addEventListener("click", () => {
  hideSetupError();
  if (!fieldValue("apiKey")) {
    showSetupError("An API key is needed to run the game master.");
    return;
  }
  if (!fieldValue("setting")) {
    showSetupError("Give the game master a setting to work with.");
    return;
  }
  if (!fieldValue("charName") || !fieldValue("charDesc")) {
    showSetupError("Your character needs a name and a description.");
    return;
  }
  if (!fieldValue("quest")) {
    showSetupError("What's the quest? Even a vague one works.");
    return;
  }
  startGame();
});

// Setting quick-fill chips (manual form)
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const targetId = chip.closest(".chip-row").dataset.fillTarget;
    document.getElementById(targetId).value = chip.dataset.value;
  });
});

// Party roster builder (manual form)
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

function clearPartyRows() {
  document.getElementById("partyList").innerHTML = "";
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
});

// ---------- Game state ----------

let state = null; // built on startGame(); see shape below
/*
  state = {
    model, apiKey,
    setting, quest,
    character: { name, desc, hp, maxHp, cash, status: [string] },
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

  party = [];
  document.querySelectorAll(".party-row").forEach((row) => {
    const name = row.querySelector(".party-name").value.trim();
    const role = row.querySelector(".party-role").value.trim();
    if (name) party.push({ name, role: role || "companion", hp: 15, maxHp: 15 });
  });

  const startHp = parseInt(fieldValue("startHp") || "20", 10);
  const startCash = parseInt(fieldValue("startCash") || "20", 10);
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
      cash: isNaN(startCash) ? 0 : startCash,
      status: [],
    },
    party,
    inventory: startItems,
    history: [],
    summaryChunks: [], // array of arrays — each consolidation adds one chunk of 4-5 short bullets
    playerTurnCount: 0,
  };

  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  document.getElementById("log").innerHTML = "";
  document.getElementById("actionInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
  renderDossier();
  saveSession();

  requestTurn(buildOpeningPrompt(), { isOpening: true });
}

function flattenSummaryBullets(maxBullets = 20) {
  const all = (state.summaryChunks || []).flat();
  return all.slice(Math.max(0, all.length - maxBullets));
}

function buildSystemPrompt() {
  const bullets = flattenSummaryBullets();
  const recap = bullets.length
    ? `\nSTORY SO FAR (condensed recap of everything before the messages below — treat it as established fact, don't re-narrate it):\n${bullets.map((b) => `- ${b}`).join("\n")}\n`
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
- Respect danger and money. Let actions fail or cost something when that's the honest outcome — including cash, when spending, being paid, gambling, bribing, or being robbed would realistically apply. Don't railroad; adapt to what the player actually tried.
- Track consequences — injuries, items found or lost, cash gained or spent, status effects (like "soaked through", "concussed", "well-rested", "wanted by the harbour police") gained or resolved, party members hurt or helped — using the state block below.
- Never resolve the whole quest in one turn. Pace it like a real campaign.

Immediately before the state block, on its own line, include one small illustration of the current scene as a flat, iconographic SVG — simple geometric shapes, no text inside it, viewBox="0 0 400 220", using only these hex colors: background/fill #E2D8BF or #EFE7D4, silhouette/linework #241F16, accent #C68A3E, danger #A23E2E, positive #5C7A5E. Keep it genuinely simple (a handful of shapes suggesting the scene — a silhouette, a horizon, an object) — not a detailed picture, and never include <script>, <foreignObject>, or any external references. Wrap it exactly like this:
<illustration><svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">...</svg></illustration>

Then, on the final line, output exactly one machine-readable state block reflecting what changed THIS turn only (use 0 / empty / false values if nothing changed):
<state>{"hp_delta": 0, "cash_delta": 0, "items_gained": [], "items_lost": [], "status_gained": [], "status_lost": [], "party_hp_deltas": {}, "quest_complete": false}</state>

Do not explain the illustration or the state block, and do not refer to either in the narration itself.`;
}

function buildOpeningPrompt() {
  return `Begin the adventure. Set the opening scene: establish the world, drop the player into their first concrete situation, and give them a reason to act right now. Do not resolve anything about the quest yet.`;
}

// ---------- API calls ----------

const CONTINUE_PROMPT =
  "The player takes no specific action right now and lets the moment pass. Continue the story from here: advance the scene, move things toward the next development or phase of the quest, and give a new concrete situation to respond to. Don't decide a new explicit action on the player's behalf.";

async function requestTurn(playerActionText, opts = {}) {
  setBusy(true);
  hideGameError();

  if (opts.isContinue) {
    appendEntry("continue", "");
  } else if (!opts.isOpening) {
    appendEntry("player", playerActionText);
  }
  state.history.push({ role: "user", content: playerActionText });

  const typingEl = appendTyping();

  try {
    const res = await callModel(state.history);
    const rawText = extractText(res);
    const { narration, patch, illustration } = parseTurn(rawText);

    state.history.push({ role: "assistant", content: rawText });

    typingEl.remove();
    appendEntry("gm", narration, patch, illustration);
    applyPatch(patch);
    renderDossier();

    if (patch.quest_complete) {
      appendEntry("system", "— The quest concludes here. Start a new game to continue. —");
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

async function callModel(messages, maxTokens = 900) {
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
  let text = rawText;

  let illustration = null;
  const illMatch = text.match(/<illustration>([\s\S]*?)<\/illustration>/);
  if (illMatch) {
    const svg = illMatch[1].trim();
    if (/^<svg[\s\S]*<\/svg>$/i.test(svg) && !/<script/i.test(svg) && !/on\w+\s*=/i.test(svg)) {
      illustration = svg;
    }
    text = text.replace(/<illustration>[\s\S]*?<\/illustration>/, "");
  }

  let patch = {
    hp_delta: 0, cash_delta: 0, items_gained: [], items_lost: [],
    status_gained: [], status_lost: [], party_hp_deltas: {}, quest_complete: false,
  };
  const stateMatch = text.match(/<state>([\s\S]*?)<\/state>/);
  if (stateMatch) {
    try {
      patch = { ...patch, ...JSON.parse(stateMatch[1]) };
    } catch (e) {
      /* malformed state block — narration still shows, patch stays neutral */
    }
    text = text.replace(/<state>[\s\S]*?<\/state>/, "");
  }

  return { narration: text.trim(), patch, illustration };
}

function applyPatch(patch) {
  if (patch.hp_delta) {
    state.character.hp = clamp(state.character.hp + patch.hp_delta, 0, state.character.maxHp);
  }
  if (patch.cash_delta) {
    state.character.cash = (state.character.cash || 0) + patch.cash_delta;
  }
  (patch.items_gained || []).forEach((item) => {
    if (item && !state.inventory.includes(item)) state.inventory.push(item);
  });
  (patch.items_lost || []).forEach((item) => {
    state.inventory = state.inventory.filter((i) => i !== item);
  });
  state.character.status = state.character.status || [];
  (patch.status_gained || []).forEach((s) => {
    if (s && !state.character.status.includes(s)) state.character.status.push(s);
  });
  (patch.status_lost || []).forEach((s) => {
    state.character.status = state.character.status.filter((x) => x !== s);
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
          "Pause the story. Summarize everything that's happened in this adventure so far as exactly 4 or 5 short bullet points (each one line, under 12 words, no leading dash or bullet character — just the line itself). Cover: where the player is now, the key thing that's happened, what they're carrying/how much cash, and any unresolved thread or status effect worth remembering. Do not invent new events. One bullet per line, nothing else — no intro, no prose, no illustration, no state block.",
      },
    ];
    const res = await callModel(summaryReq, 200);
    const raw = extractText(res).trim();
    const bullets = raw
      .split("\n")
      .map((l) => l.replace(/^[\s*•\-–]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    if (bullets.length) {
      state.summaryChunks = state.summaryChunks || [];
      state.summaryChunks.push(bullets);
      state.history = [];
      renderStorySoFar();
    }
  } catch (e) {
    /* consolidation is best-effort — if it fails, the transcript just keeps growing normally */
  }
}

// ---------- "Story so far" panel — latest chunk visible, older chunks behind "See more" ----------

function renderStorySoFar() {
  const chunks = state.summaryChunks || [];
  if (!chunks.length) return;

  const existing = document.getElementById("storySoFar");
  if (existing) existing.remove();

  const latest = chunks[chunks.length - 1];
  const older = chunks.slice(0, -1).flat();

  const box = document.createElement("div");
  box.id = "storySoFar";
  box.className = "story-so-far";

  const label = document.createElement("span");
  label.className = "story-so-far-label";
  label.textContent = "Story so far";
  box.appendChild(label);

  const list = document.createElement("ul");
  latest.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    list.appendChild(li);
  });
  box.appendChild(list);

  if (older.length) {
    const moreList = document.createElement("ul");
    moreList.hidden = true;
    older.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      moreList.appendChild(li);
    });

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "story-see-more";
    toggle.textContent = `See more (${older.length})`;
    toggle.addEventListener("click", () => {
      moreList.hidden = !moreList.hidden;
      toggle.textContent = moreList.hidden ? `See more (${older.length})` : "See less";
    });

    box.appendChild(toggle);
    box.appendChild(moreList);
  }

  const log = document.getElementById("log");
  log.appendChild(box);
  log.scrollTop = log.scrollHeight;
}

// ---------- Rendering ----------

function appendEntry(kind, text, patch, illustration) {
  const log = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = `entry entry-${kind}`;

  if (kind === "gm") {
    if (illustration) {
      const fig = document.createElement("div");
      fig.className = "illustration";
      fig.innerHTML = illustration;
      entry.appendChild(fig);
    }
    text.split(/\n{2,}/).forEach((para) => {
      if (!para.trim()) return;
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
  } else if (kind === "continue") {
    entry.textContent = "⏭ continuing…";
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
  if (patch.cash_delta > 0) notes.push({ type: "gain", text: `+${patch.cash_delta} cash` });
  if (patch.cash_delta < 0) notes.push({ type: "loss", text: `${patch.cash_delta} cash` });
  (patch.items_gained || []).forEach((i) => notes.push({ type: "gain", text: `+ ${i}` }));
  (patch.items_lost || []).forEach((i) => notes.push({ type: "loss", text: `− ${i}` }));
  (patch.status_gained || []).forEach((s) => notes.push({ type: "loss", text: `+ ${s}` }));
  (patch.status_lost || []).forEach((s) => notes.push({ type: "gain", text: `resolved: ${s}` }));
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

  document.getElementById("cashText").textContent = `${state.character.cash ?? 0}`;

  const statusList = document.getElementById("statusList");
  statusList.innerHTML = "";
  (state.character.status || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    statusList.appendChild(li);
  });

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
  document.getElementById("continueBtn").disabled = busy;
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

document.getElementById("continueBtn").addEventListener("click", () => {
  if (!state) return;
  requestTurn(CONTINUE_PROMPT, { isContinue: true });
});

document.getElementById("newGameBtn").addEventListener("click", () => {
  if (!confirm("Start a new game? This one will be cleared.")) return;
  localStorage.removeItem(STORAGE_KEY);
  quickStart(Math.random() < 0.5 ? "adventure" : "life");
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
  state.character.status = state.character.status || [];
  state.character.cash = state.character.cash ?? 0;
  if (!state.summaryChunks && typeof state.summary === "string" && state.summary) {
    // migrate an older save's single prose summary into the new bullet format
    state.summaryChunks = [state.summary.split(/\n+/).map((s) => s.trim()).filter(Boolean)];
  }
  state.summaryChunks = state.summaryChunks || [];

  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  renderDossier();

  const log = document.getElementById("log");
  log.innerHTML = "";
  renderStorySoFar();
  (state.history || []).forEach((turn) => {
    if (turn.role === "user") {
      if (turn.content.startsWith("Begin the adventure")) return;
      if (turn.content === CONTINUE_PROMPT) {
        appendEntry("continue", "");
        return;
      }
      appendEntry("player", turn.content);
    } else {
      const { narration, illustration } = parseTurn(turn.content);
      appendEntry("gm", narration, null, illustration);
    }
  });
  return true;
}

if (!tryRestoreSession()) {
  // setup screen already visible by default
}
