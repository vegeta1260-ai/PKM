const {calculate, Generations, Pokemon, Move, Field} = require("@smogon/calc");

const GEN = 9;
const LEVEL = 50;
const gen = Generations.get(GEN);

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
  const pokemon = new Pokemon(gen, payload.species, {
    level: payload.level || LEVEL,
    ability: payload.ability,
    item: payload.item,
    status: payload.status || "",
    boosts: payload.boosts || {},
    teraType: payload.teraType,
    evs: statPointsToEvs(statPoints),
    ivs: payload.ivs || {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
    nature: "Serious",
  });
  const stats = championsStats(pokemon.species, statPoints, payload.alignment);
  pokemon.rawStats = {...stats};
  pokemon.stats = {...stats};
  pokemon.originalCurHP = stats.hp;
  if (payload.curHP !== undefined) pokemon.curHP = Number(payload.curHP);
  return pokemon;
}

function normalizeWeather(weather) {
  if (!weather) return undefined;
  const text = String(weather).toLowerCase();
  if (["sun", "sunny", "harsh sunlight", "晴天"].includes(text)) return "Sun";
  if (["rain", "雨天"].includes(text)) return "Rain";
  if (["sand", "sandstorm", "沙暴"].includes(text)) return "Sand";
  if (["snow", "雪"].includes(text)) return "Snow";
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

function critChancePercent(critStage = 0, alwaysCrit = false) {
  if (alwaysCrit) return 100;
  const stage = Math.max(0, Number(critStage || 0));
  if (stage <= 0) return round1(100 / 24);
  if (stage === 1) return 12.5;
  if (stage === 2) return 50;
  return 100;
}

function calculateDamageCore(request) {
  const attacker = makePokemon(request.attacker);
  const defender = makePokemon(request.defender);
  const move = new Move(gen, request.move.name, {
    isCrit: Boolean(request.move.isCrit || request.move.alwaysCrit),
    hits: request.move.hits,
    useZ: Boolean(request.move.useZ),
  });
  const field = makeField(request.field || {});
  const result = calculate(gen, attacker, defender, move, field);
  const rolls = flattenDamage(result.damage);
  const hpNow = currentHp(defender, request.defender);
  const maxHp = defender.stats.hp;
  const koRolls = rolls.filter((damage) => damage >= hpNow).length;
  const accuracy = request.move.accuracy !== undefined ? Number(request.move.accuracy) : undefined;

  return {
    engine: "@smogon/calc",
    engineVersion: require("@smogon/calc/package.json").version,
    generation: GEN,
    level: LEVEL,
    attacker: {
      species: attacker.name,
      ability: attacker.ability,
      item: attacker.item,
      stats: attacker.stats,
      boosts: attacker.boosts,
    },
    defender: {
      species: defender.name,
      ability: defender.ability,
      item: defender.item,
      stats: defender.stats,
      boosts: defender.boosts,
      currentHp: hpNow,
      maxHp,
    },
    move: {
      name: move.name,
      type: move.type,
      category: move.category,
      bp: move.bp,
      isCrit: move.isCrit,
    },
    field: request.field || {},
    damageRolls: rolls,
    damageRange: rolls.length ? [Math.min(...rolls), Math.max(...rolls)] : [0, 0],
    damagePercentOfMaxHp: rolls.length
      ? [round1(Math.min(...rolls) / maxHp * 100), round1(Math.max(...rolls) / maxHp * 100)]
      : [0, 0],
    koChance: {
      rolls: koRolls,
      total: rolls.length,
      percent: rolls.length ? round1(koRolls / rolls.length * 100) : 0,
      withAccuracyPercent: accuracy && rolls.length ? round1(koRolls / rolls.length * accuracy) : undefined,
    },
    description: typeof result.fullDesc === "function" ? result.fullDesc() : result.desc(),
  };
}

function calculateDamage(request) {
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
  return {
    ...base,
    critical: {
      chancePercent: critChancePercent(request.move.critStage || 0, Boolean(request.move.alwaysCrit)),
      damageRolls: critical.damageRolls,
      damageRange: critical.damageRange,
      damagePercentOfMaxHp: critical.damagePercentOfMaxHp,
      koChance: critical.koChance,
      description: critical.description,
    },
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
  return {
    species: pokemon.name,
    ability: pokemon.ability,
    item: pokemon.item,
    rawSpeed: pokemon.stats.spe,
    effectiveSpeed: speed,
    notes,
  };
}

function compareSpeed(request) {
  const left = calculateSpeed(request.left, request.field || {});
  const right = calculateSpeed(request.right, request.field || {});
  let faster = "tie";
  if (left.effectiveSpeed > right.effectiveSpeed) faster = "left";
  if (right.effectiveSpeed > left.effectiveSpeed) faster = "right";
  return {left, right, faster};
}

module.exports = {
  GEN,
  LEVEL,
  statPointToEv,
  statPointsToEvs,
  championsStats,
  makePokemon,
  calculateDamage,
  critChancePercent,
  calculateSpeed,
  compareSpeed,
};
