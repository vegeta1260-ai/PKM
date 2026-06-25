const {calculateDamage, compareSpeed} = require("../championsAdapter");

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

console.log("Typhlosion Flamethrower vs Mega Venusaur");
console.log(calculateDamage({
  attacker: typhlosion,
  defender: megaVenusaur,
  move: {name: "Flamethrower"},
  field: {},
}));

console.log("Mega Charizard Y Sun Flamethrower vs Mega Venusaur");
console.log(calculateDamage({
  attacker: charizardY,
  defender: megaVenusaur,
  move: {name: "Flamethrower"},
  field: {weather: "Sun"},
}));

console.log("Meowscarada vs Primarina speed");
console.log(compareSpeed({
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
}));
