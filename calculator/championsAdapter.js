const fs = require("fs");
const path = require("path");
const {calculate, Generations, Pokemon, Move, Field} = require("@smogon/calc");

const ADAPTER_VERSION = "2026-06-26-adapter-v1.5.2";
const GEN = 9;
const LEVEL = 50;
const gen = Generations.get(GEN);
const aliasPath = path.join(__dirname, "data", "zh_aliases.json");

// Built-in aliases are a safety net for Vercel deployments where calculator/data/zh_aliases.json
// is missing, incomplete, or not bundled. File aliases still override/extend these entries.
const BUILTIN_ALIASES = {
  pokemon: {
    "mega噴火龍y": "Charizard-Mega-Y",
    "megacharizardy": "Charizard-Mega-Y",
    "噴火龍y": "Charizard-Mega-Y",
    "噴火龍mega-y": "Charizard-Mega-Y",
    "噴火龍megay": "Charizard-Mega-Y",
    "mega噴火龍x": "Charizard-Mega-X",
    "megacharizardx": "Charizard-Mega-X",
    "噴火龍x": "Charizard-Mega-X",
    "噴火龍": "Charizard",
    "mega妙蛙花": "Venusaur-Mega",
    "megavenusaur": "Venusaur-Mega",
    "妙蛙花mega": "Venusaur-Mega",
    "妙蛙花": "Venusaur",
    "火暴獸": "Typhlosion",
    "火爆獸": "Typhlosion",
    "講究圍巾火暴獸": "Typhlosion",
    "講究圍巾火爆獸": "Typhlosion",
    "烈咬陸鯊": "Garchomp",
    "鋁鋼橋龍": "Archaludon",
    "鋁鋼龍": "Duraludon",
    "風妖精": "Whimsicott",
    "西獅海壬": "Primarina",
    "洗衣機洛托姆": "Rotom-Wash",
    "洗衣洛托姆": "Rotom-Wash",
    "洛托姆洗衣機": "Rotom-Wash",
    "洛托姆水洗": "Rotom-Wash",
    "鋼鎧鴉": "Corviknight",
    "大嘴鷗": "Pelipper",
    "mega巨沼怪": "Swampert-Mega",
    "巨沼怪mega": "Swampert-Mega",
    "巨沼怪": "Swampert",
    "魔幻假面喵": "Meowscarada",
    "多龍巴魯托": "Dragapult",
    "班基拉斯": "Tyranitar",
    "快龍": "Dragonite",
    "耿鬼": "Gengar",
    "帝王拿波": "Empoleon",
    "巨鉗螳螂": "Scizor",
    "路卡利歐": "Lucario",
    "仙子伊布": "Sylveon",
    "風速狗": "Arcanine",
    "雷丘": "Raichu",
    "河馬獸": "Hippowdon",
    "三首惡龍": "Hydreigon",
    "大竺葵": "Meganium",
    "老翁龍": "Drampa",
    "波士可多拉": "Aggron",
    "mega暴鯉龍": "Gyarados-Mega",
    "暴鯉龍mega": "Gyarados-Mega",
    "暴鯉龍": "Gyarados",
    "姆克鷹": "Staraptor",
    "煤炭龜": "Torkoal",
    "古劍豹": "Chien-Pao",
    "古鼎鹿": "Ting-Lu",
    "古玉魚": "Chi-Yu",
    "古簡蝸": "Wo-Chien"
  },
  moves: {
    "噴射火焰": "Flamethrower",
    "噴火": "Eruption",
    "熱風": "Heat Wave",
    "火焰放射": "Flamethrower",
    "大字爆炎": "Fire Blast",
    "日光束": "Solar Beam",
    "空氣斬": "Air Slash",
    "暴風": "Hurricane",
    "勇鳥猛攻": "Brave Bird",
    "地震": "Earthquake",
    "逆鱗": "Outrage",
    "龍爪": "Dragon Claw",
    "水流噴射": "Aqua Jet",
    "月亮之力": "Moonblast",
    "巨聲": "Hyper Voice",
    "打雷": "Thunder",
    "十萬伏特": "Thunderbolt",
    "伏特替換": "Volt Switch",
    "水炮": "Hydro Pump",
    "水砲": "Hydro Pump",
    "冰凍光束": "Ice Beam",
    "污泥炸彈": "Sludge Bomb",
    "終極吸取": "Giga Drain",
    "花朵加農炮": "Fleur Cannon",
    "叩打": "Knock Off",
    "拍落": "Knock Off",
    "千變萬花": "Flower Trick",
    "急速折返": "U-turn",
    "守住": "Protect"
  },
  abilities: {
    "日照": "Drought",
    "旱災": "Drought",
    "厚脂肪": "Thick Fat",
    "葉綠素": "Chlorophyll",
    "悠游自如": "Swift Swim",
    "揚沙": "Sand Stream",
    "撥沙": "Sand Rush",
    "降雨": "Drizzle",
    "飄浮": "Levitate",
    "破格": "Mold Breaker",
    "多重鱗片": "Multiscale",
    "猛火": "Blaze",
    "激流": "Torrent",
    "茂盛": "Overgrow",
    "妖精皮膚": "Pixilate",
    "惡作劇之心": "Prankster",
    "威嚇": "Intimidate",
    "緊張感": "Unnerve"
  },
  items: {
    "講究圍巾": "Choice Scarf",
    "圍巾": "Choice Scarf",
    "講究眼鏡": "Choice Specs",
    "眼鏡": "Choice Specs",
    "講究頭帶": "Choice Band",
    "頭帶": "Choice Band",
    "生命寶珠": "Life Orb",
    "命玉": "Life Orb",
    "凸凸頭盔": "Rocky Helmet",
    "吃剩的東西": "Leftovers",
    "文柚果": "Sitrus Berry",
    "神秘水滴": "Mystic Water",
    "先制之爪": "Quick Claw",
    "噴火龍進化石y": "Charizardite Y",
    "噴火龍進化石x": "Charizardite X",
    "妙蛙花進化石": "Venusaurite",
    "巨沼怪進化石": "Swampertite"
  }
};

function normalizeAliasMap(aliasMap = {}) {
  const normalized = {};
  for (const [category, entries] of Object.entries(aliasMap)) {
    normalized[category] = normalized[category] || {};
    for (const [key, value] of Object.entries(entries || {})) {
      normalized[category][normalizeAliasKey(key)] = value;
    }
  }
  return normalized;
}

const fileAliases = fs.existsSync(aliasPath)
  ? normalizeAliasMap(JSON.parse(fs.readFileSync(aliasPath, "utf8")))
  : {pokemon: {}, moves: {}, abilities: {}, items: {}};

const zhAliases = {
  pokemon: {...normalizeAliasMap(BUILTIN_ALIASES).pokemon, ...(fileAliases.pokemon || {})},
  moves: {...normalizeAliasMap(BUILTIN_ALIASES).moves, ...(fileAliases.moves || {})},
  abilities: {...normalizeAliasMap(BUILTIN_ALIASES).abilities, ...(fileAliases.abilities || {})},
  items: {...normalizeAliasMap(BUILTIN_ALIASES).items, ...(fileAliases.items || {})},
};

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_ALIASES = {
  hp: "hp",
  attack: "atk",
  atk: "atk",
  "攻擊": "atk",
  defense: "def",
  def: "def",
  "防禦": "def",
  spa: "spa",
  spatk: "spa",
  "特攻": "spa",
  spd: "spd",
  spdef: "spd",
  "特防": "spd",
  speed: "spe",
  spe: "spe",
  "速度": "spe",
};

function statPointToEv(statPoint = 0) {
  const sp = Number(statPoint || 0);
  if (!Number.isInteger(sp) || sp < 0 || sp > 32) {
    throw new Error(`Invalid Champions stat point: ${statPoint}. Expected integer 0..32.`);
  }
  return sp === 0 ? 0 : 4 + 8 * (sp - 1);
}

function normalizeAliasKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
}

function canonicalName(category, value) {
  if (!value) return value;
  const key = normalizeAliasKey(value);
  return zhAliases[category] && zhAliases[category][key] ? zhAliases[category][key] : value;
}

function canonicalPokemon(value) {
  return canonicalName("pokemon", value);
}

function canonicalMove(value) {
  return canonicalName("moves", value);
}

function canonicalAbility(value) {
  return canonicalName("abilities", value);
}

function canonicalItem(value) {
  return canonicalName("items", value);
}

function resolveSpeciesStrict(inputSpecies) {
  const resolvedSpecies = canonicalPokemon(inputSpecies);
  const species = gen.species.get(resolvedSpecies);
  if (!species || !species.baseStats) {
    throw new Error(`Unknown species: ${inputSpecies} (resolved as ${resolvedSpecies}). Add it to calculator/data/zh_aliases.json or BUILTIN_ALIASES.`);
  }
  return {resolvedSpecies, species};
}

function getAdapterInfo() {
  let canary = {};
  try {
    const resolved = resolveSpeciesStrict("Mega噴火龍Y");
    canary = {
      input: "Mega噴火龍Y",
      resolvedSpecies: resolved.resolvedSpecies,
      baseHp: resolved.species.baseStats.hp,
      aliasKey: normalizeAliasKey("Ｍｅｇａ 噴火龍 Ｙ"),
    };
  } catch (error) {
    canary = {error: error.message};
  }
  return {
    version: ADAPTER_VERSION,
    hasBuiltinAliases: true,
    canary,
  };
}

function statPointsToEvs(statPoints = {}) {
  const evs = {};
  for (const key of STAT_KEYS) evs[key] = statPointToEv(statPoints[key] || 0);
  return evs;
}

function normalizeStatName(name) {
  if (!name) return "";
  const key = String(name).toLowerCase().replace(/[\s_+-]/g, "");
  return STAT_ALIASES[key] || STAT_ALIASES[String(name)] || "";
}

function normalizeAlignment(alignment) {
  const modifiers = {hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1};
  if (!alignment) return modifiers;

  if (typeof alignment === "object" && !Array.isArray(alignment)) {
    if (alignment.plus) modifiers[normalizeStatName(alignment.plus)] = 1.1;
    if (alignment.minus) modifiers[normalizeStatName(alignment.minus)] = 0.9;
    for (const [rawKey, value] of Object.entries(alignment)) {
      const key = normalizeStatName(rawKey);
      if (!key || key === "hp") continue;
      if (value === "+" || value === "plus" || value === 1.1 || value === true) modifiers[key] = 1.1;
      if (value === "-" || value === "minus" || value === 0.9) modifiers[key] = 0.9;
    }
    return modifiers;
  }

  const text = String(alignment);
  const tokenPattern = /(HP|Attack|Atk|Defense|Def|SpA|SpAtk|SpD|SpDef|Speed|Spe|攻擊|防禦|特攻|特防|速度)\s*([+-])/gi;
  let match;
  while ((match = tokenPattern.exec(text))) {
    const key = normalizeStatName(match[1]);
    if (key && key !== "hp") modifiers[key] = match[2] === "+" ? 1.1 : 0.9;
  }
  return modifiers;
}

function championsStats(species, statPoints = {}, alignment) {
  if (!species || !species.baseStats) {
    throw new Error("Unknown species: calculator could not resolve base stats.");
  }
  const mods = normalizeAlignment(alignment);
  const base = species.baseStats;
  const stats = {};
  stats.hp = base.hp + 75 + Number(statPoints.hp || 0);
  for (const key of ["atk", "def", "spa", "spd", "spe"]) {
    stats[key] = Math.floor((base[key] + 20 + Number(statPoints[key] || 0)) * (mods[key] || 1));
  }
  return stats;
}

function makePokemon(payload = {}) {
  if (!payload.species) throw new Error("Pokemon payload requires species.");
  const statPoints = payload.statPoints || {};
  const {resolvedSpecies, species} = resolveSpeciesStrict(payload.species);
  const resolvedAbility = canonicalAbility(payload.ability);
  const resolvedItem = canonicalItem(payload.item);
  const pokemon = new Pokemon(gen, resolvedSpecies, {
    level: payload.level || LEVEL,
    ability: resolvedAbility,
    item: resolvedItem,
    status: payload.status || "",
    boosts: payload.boosts || {},
    teraType: payload.teraType,
    evs: statPointsToEvs(statPoints),
    ivs: payload.ivs || {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
    nature: "Serious",
  });
  const stats = championsStats(species, statPoints, payload.alignment);
  pokemon.rawStats = {...stats};
  pokemon.stats = {...stats};
  pokemon.originalCurHP = stats.hp;
  if (payload.curHP !== undefined) pokemon.curHP = Number(payload.curHP);
  pokemon.inputNames = {
    species: payload.species,
    ability: payload.ability,
    item: payload.item,
    resolvedSpecies,
    resolvedAbility,
    resolvedItem,
  };
  return pokemon;
}

function normalizeWeather(weather) {
  if (!weather) return undefined;
  const text = String(weather).toLowerCase();
  if (["sun", "sunny", "harsh sunlight", "晴天", "大晴天", "日照"].includes(text)) return "Sun";
  if (["rain", "雨天", "下雨", "降雨"].includes(text)) return "Rain";
  if (["sand", "sandstorm", "沙暴"].includes(text)) return "Sand";
  if (["snow", "雪", "下雪"].includes(text)) return "Snow";
  if (["hail", "冰雹"].includes(text)) return "Hail";
  return weather;
}

function makeField(payload = {}) {
  return new Field({
    gameType: payload.gameType || "Singles",
    weather: normalizeWeather(payload.weather),
    terrain: payload.terrain,
    attackerSide: {
      isHelpingHand: Boolean(payload.attackerSide && payload.attackerSide.isHelpingHand),
      isTailwind: Boolean(payload.attackerSide && payload.attackerSide.isTailwind),
    },
    defenderSide: {
      isReflect: Boolean(payload.defenderSide && payload.defenderSide.isReflect),
      isLightScreen: Boolean(payload.defenderSide && payload.defenderSide.isLightScreen),
      isAuroraVeil: Boolean(payload.defenderSide && payload.defenderSide.isAuroraVeil),
      isFriendGuard: Boolean(payload.defenderSide && payload.defenderSide.isFriendGuard),
    },
  });
}

function flattenDamage(damage) {
  if (Array.isArray(damage)) return damage.flat(Infinity).filter((x) => typeof x === "number");
  if (typeof damage === "number") return [damage];
  return [];
}

function currentHp(defender, requestDefender = {}) {
  if (requestDefender.currentHp !== undefined) return Number(requestDefender.currentHp);
  if (requestDefender.currentHpPercent !== undefined) {
    return Math.ceil(defender.stats.hp * Number(requestDefender.currentHpPercent) / 100);
  }
  return defender.stats.hp;
}

function requirePath(payload, pathText) {
  const value = pathText.split(".").reduce((node, key) => node && node[key], payload);
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required field: ${pathText}`);
  }
}

function validateDamageRequest(request = {}) {
  requirePath(request, "attacker.species");
  requirePath(request, "defender.species");
  requirePath(request, "move.name");
}

function validateSpeedPayload(pokemonPayload = {}) {
  requirePath(pokemonPayload, "species");
}

function validateCompareSpeedRequest(request = {}) {
  requirePath(request, "left.species");
  requirePath(request, "right.species");
}

function critChancePercent(critStage = 0, alwaysCrit = false) {
  if (alwaysCrit) return 100;
  const stage = Math.max(0, Number(critStage || 0));
  if (stage <= 0) return round1(100 / 24);
  if (stage === 1) return 12.5;
  if (stage === 2) return 50;
  return 100;
}

function formatRange(range) {
  return `${range[0]}-${range[1]}`;
}

function formatFixed1(value) {
  return Number(value).toFixed(1);
}

function formatPercentRange(range) {
  return `${formatFixed1(range[0])}%-${formatFixed1(range[1])}%`;
}

function formatKoChance(koChance) {
  return `${koChance.rolls}/${koChance.total} 擊殺（${formatFixed1(koChance.percent)}%）`;
}

function recommendationFromKoChance(koChance) {
  if (!koChance || !koChance.total) return "先不要依賴此招收掉。";
  if (koChance.rolls === koChance.total) return "可收，直接打。";
  if (koChance.rolls > 0) return "有機會收，但不穩。";
  return "不能穩收，先看補刀、換人或守住。";
}

function buildDamageVoiceSummary(result, critical) {
  const normalLine = `傷害：${formatRange(result.damageRange)}（${formatPercentRange(result.damagePercentOfMaxHp)}），${formatKoChance(result.koChance)}。`;
  const summary = {
    normalLine,
    koLine: formatKoChance(result.koChance),
    recommendationHint: recommendationFromKoChance(result.koChance),
  };
  if (critical) {
    summary.criticalLine = `CT：${critical.chancePercent}%；${formatRange(critical.damageRange)}（${formatPercentRange(critical.damagePercentOfMaxHp)}），${formatKoChance(critical.koChance)}。`;
  }
  return summary;
}

function buildSpeedVoiceSummary(speedResult) {
  return {
    speedLine: `速度：${speedResult.species} ${speedResult.rawSpeed}，有效速度 ${speedResult.effectiveSpeed}。`,
    recommendationHint: "用這個有效速度判斷先後手。",
  };
}

function buildCompareSpeedVoiceSummary(left, right, faster) {
  const fasterText = faster === "tie" ? "同速" : faster === "left" ? "左方較快" : "右方較快";
  return {
    speedLine: `速度：${left.species} ${left.effectiveSpeed}，${right.species} ${right.effectiveSpeed}；${fasterText}。`,
    recommendationHint: faster === "tie" ? "同速要按風險處理。" : `${fasterText}，先按這個先後手判斷。`,
  };
}

function calculateDamageCore(request) {
  const attacker = makePokemon(request.attacker);
  const defender = makePokemon(request.defender);
  const resolvedMove = canonicalMove(request.move.name);
  const move = new Move(gen, resolvedMove, {
    isCrit: Boolean(request.move.isCrit || request.move.alwaysCrit),
    hits: request.move.hits,
    useZ: Boolean(request.move.useZ),
  });
  if (!move.name || !move.type || move.bp === undefined) {
    throw new Error(`Unknown move: ${request.move.name} (resolved as ${resolvedMove}). Add it to calculator/data/zh_aliases.json or BUILTIN_ALIASES.`);
  }
  const field = makeField(request.field || {});
  const result = calculate(gen, attacker, defender, move, field);
  const rolls = flattenDamage(result.damage);
  const hpNow = currentHp(defender, request.defender);
  const maxHp = defender.stats.hp;
  const koRolls = rolls.filter((damage) => damage >= hpNow).length;
  const accuracy = request.move.accuracy !== undefined ? Number(request.move.accuracy) : undefined;
  const damageRange = rolls.length ? [Math.min(...rolls), Math.max(...rolls)] : [0, 0];
  const damagePercentOfMaxHp = rolls.length
    ? [round1(Math.min(...rolls) / maxHp * 100), round1(Math.max(...rolls) / maxHp * 100)]
    : [0, 0];
  const koChance = {
    rolls: koRolls,
    total: rolls.length,
    percent: rolls.length ? round1(koRolls / rolls.length * 100) : 0,
    withAccuracyPercent: accuracy && rolls.length ? round1(koRolls / rolls.length * accuracy) : undefined,
  };

  const response = {
    engine: "@smogon/calc",
    engineVersion: require("@smogon/calc/package.json").version,
    generation: GEN,
    level: LEVEL,
    attacker: {
      species: attacker.name,
      inputSpecies: attacker.inputNames.species,
      ability: attacker.ability,
      inputAbility: attacker.inputNames.ability,
      item: attacker.item,
      inputItem: attacker.inputNames.item,
      stats: attacker.stats,
      boosts: attacker.boosts,
    },
    defender: {
      species: defender.name,
      inputSpecies: defender.inputNames.species,
      ability: defender.ability,
      inputAbility: defender.inputNames.ability,
      item: defender.item,
      inputItem: defender.inputNames.item,
      stats: defender.stats,
      boosts: defender.boosts,
      currentHp: hpNow,
      maxHp,
    },
    move: {
      name: move.name,
      inputName: request.move.name,
      type: move.type,
      category: move.category,
      bp: move.bp,
      isCrit: move.isCrit,
    },
    field: request.field || {},
    damageRolls: rolls,
    damageRange,
    damagePercentOfMaxHp,
    koChance,
    description: typeof result.fullDesc === "function" ? result.fullDesc() : result.desc(),
  };
  response.voiceSummary = buildDamageVoiceSummary(response);
  return response;
}

function calculateDamage(request) {
  validateDamageRequest(request);
  const base = calculateDamageCore(request);
  if (!request.move || !request.move.includeCritical) return base;

  const criticalRequest = {
    ...request,
    move: {
      ...request.move,
      includeCritical: false,
      isCrit: true,
    },
  };
  const critical = calculateDamageCore(criticalRequest);
  const criticalSummary = {
    chancePercent: critChancePercent(request.move.critStage || 0, Boolean(request.move.alwaysCrit)),
    damageRolls: critical.damageRolls,
    damageRange: critical.damageRange,
    damagePercentOfMaxHp: critical.damagePercentOfMaxHp,
    koChance: critical.koChance,
    description: critical.description,
  };
  return {
    ...base,
    critical: criticalSummary,
    voiceSummary: buildDamageVoiceSummary(base, criticalSummary),
  };
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function stageMultiplier(stage = 0) {
  const s = Math.max(-6, Math.min(6, Number(stage || 0)));
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}

function calculateSpeed(pokemonPayload = {}, field = {}) {
  validateSpeedPayload(pokemonPayload);
  const pokemon = makePokemon(pokemonPayload);
  let speed = pokemon.stats.spe;
  const notes = [`base calculated speed ${speed}`];
  if (pokemonPayload.boosts && pokemonPayload.boosts.spe) {
    speed = Math.floor(speed * stageMultiplier(pokemonPayload.boosts.spe));
    notes.push(`speed stage ${pokemonPayload.boosts.spe}`);
  }
  if (pokemon.item === "Choice Scarf") {
    speed = Math.floor(speed * 1.5);
    notes.push("Choice Scarf x1.5");
  }
  const weather = normalizeWeather(field.weather);
  if (pokemon.ability === "Chlorophyll" && weather === "Sun") {
    speed = Math.floor(speed * 2);
    notes.push("Chlorophyll in Sun x2");
  }
  if (pokemon.ability === "Swift Swim" && weather === "Rain") {
    speed = Math.floor(speed * 2);
    notes.push("Swift Swim in Rain x2");
  }
  if (pokemon.ability === "Sand Rush" && weather === "Sand") {
    speed = Math.floor(speed * 2);
    notes.push("Sand Rush in Sand x2");
  }
  if (pokemon.ability === "Slush Rush" && (weather === "Snow" || weather === "Hail")) {
    speed = Math.floor(speed * 2);
    notes.push("Slush Rush in Snow/Hail x2");
  }
  if (pokemonPayload.unburdenActive) {
    speed = Math.floor(speed * 2);
    notes.push("Unburden active x2");
  }
  if (field.tailwind) {
    speed = Math.floor(speed * 2);
    notes.push("Tailwind x2");
  }
  if (pokemonPayload.status === "par") {
    speed = Math.floor(speed * 0.5);
    notes.push("Paralysis x0.5");
  }
  const response = {
    species: pokemon.name,
    ability: pokemon.ability,
    item: pokemon.item,
    rawSpeed: pokemon.stats.spe,
    effectiveSpeed: speed,
    notes,
  };
  response.voiceSummary = buildSpeedVoiceSummary(response);
  return response;
}

function compareSpeed(request) {
  validateCompareSpeedRequest(request);
  const left = calculateSpeed(request.left, request.field || {});
  const right = calculateSpeed(request.right, request.field || {});
  let faster = "tie";
  if (left.effectiveSpeed > right.effectiveSpeed) faster = "left";
  if (right.effectiveSpeed > left.effectiveSpeed) faster = "right";
  return {left, right, faster, voiceSummary: buildCompareSpeedVoiceSummary(left, right, faster)};
}

module.exports = {
  ADAPTER_VERSION,
  GEN,
  LEVEL,
  statPointToEv,
  statPointsToEvs,
  championsStats,
  makePokemon,
  canonicalName,
  canonicalPokemon,
  canonicalMove,
  canonicalAbility,
  canonicalItem,
  calculateDamage,
  critChancePercent,
  calculateSpeed,
  compareSpeed,
  getAdapterInfo,
};
