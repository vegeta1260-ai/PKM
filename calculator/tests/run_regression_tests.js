const assert = require("assert");
const {calculateDamage, compareSpeed, calculateSpeed, critChancePercent} = require("../championsAdapter");

function rangeClose(actual, expected, tolerance = 2) {
  assert(Math.abs(actual[0] - expected[0]) <= tolerance, `min expected ${expected[0]}, got ${actual[0]}`);
  assert(Math.abs(actual[1] - expected[1]) <= tolerance, `max expected ${expected[1]}, got ${actual[1]}`);
}

const megaVenusaur = {
  species: "Venusaur-Mega",
  ability: "Thick Fat",
  statPoints: {hp: 32, def: 32, spd: 2},
  alignment: {plus: "def"},
};

const typhlosion = {
  species: "Typhlosion",
  ability: "Blaze",
  item: "Choice Scarf",
  statPoints: {hp: 2, spa: 32, spe: 32},
  alignment: {plus: "spe"},
};

const charizardY = {
  species: "Charizard-Mega-Y",
  ability: "Drought",
  statPoints: {hp: 2, spa: 32, spe: 32},
  alignment: {plus: "spe"},
};

const typhlosionResult = calculateDamage({
  attacker: typhlosion,
  defender: megaVenusaur,
  move: {name: "Flamethrower"},
  field: {},
});
rangeClose(typhlosionResult.damagePercentOfMaxHp, [31, 37], 1.5);

const charizardResult = calculateDamage({
  attacker: charizardY,
  defender: megaVenusaur,
  move: {name: "Flamethrower", includeCritical: true, critStage: 0},
  field: {weather: "Sun"},
});
rangeClose(charizardResult.damagePercentOfMaxHp, [62, 74], 1.5);
assert(charizardResult.damageRange[0] > typhlosionResult.damageRange[0], "Sun Mega Charizard Y should hit harder than Typhlosion");
assert(charizardResult.critical, "includeCritical should return critical result");
assert.strictEqual(charizardResult.critical.chancePercent, 4.2);
assert(charizardResult.critical.damageRange[0] > charizardResult.damageRange[0], "critical damage should exceed normal damage");
assert.strictEqual(critChancePercent(1), 12.5);
assert.strictEqual(critChancePercent(2), 50);
assert.strictEqual(critChancePercent(3), 100);
assert.strictEqual(critChancePercent(0, true), 100);

const speed = compareSpeed({
  left: {
    species: "Meowscarada",
    ability: "Protean",
    statPoints: {atk: 32, spe: 32, hp: 2},
    alignment: {plus: "spe"},
  },
  right: {
    species: "Primarina",
    ability: "Torrent",
    statPoints: {spa: 32, hp: 32, spd: 2},
    alignment: {plus: "spa"},
  },
});
assert.strictEqual(speed.left.effectiveSpeed, 192);
assert.strictEqual(speed.right.effectiveSpeed, 80);
assert.strictEqual(speed.faster, "left");

const gyarados = calculateSpeed({
  species: "Gyarados-Mega",
  ability: "Mold Breaker",
  item: "Gyaradosite",
  statPoints: {atk: 32, spe: 32, hp: 2},
  alignment: {plus: "spe"},
  boosts: {spe: 1},
});
assert.strictEqual(gyarados.effectiveSpeed, 219);

console.log("All calculator regression tests passed.");
