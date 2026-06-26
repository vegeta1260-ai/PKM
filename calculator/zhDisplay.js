const TERM_MAP = {
  "Charizard-Mega-Y": "Mega噴火龍Y",
  "charizardmegay": "Mega噴火龍Y",
  "Charizard-Mega-X": "Mega噴火龍X",
  "charizardmegax": "Mega噴火龍X",
  "Charizard": "噴火龍",
  "Venusaur-Mega": "Mega妙蛙花",
  "venusaurmega": "Mega妙蛙花",
  "Venusaur": "妙蛙花",
  "Typhlosion": "火暴獸",
  "typhlosion": "火暴獸",
  "Meowscarada": "魔幻假面喵",
  "meowscarada": "魔幻假面喵",
  "Garchomp": "烈咬陸鯊",
  "Archaludon": "鋁鋼橋龍",
  "Whimsicott": "風妖精",
  "Primarina": "西獅海壬",
  "Rotom-Wash": "洗衣機洛托姆",
  "rotomwash": "洗衣機洛托姆",
  "Corviknight": "鋼鎧鴉",
  "Pelipper": "大嘴鷗",
  "Swampert-Mega": "Mega巨沼怪",
  "swampertmega": "Mega巨沼怪",
  "Swampert": "巨沼怪",
  "Dragapult": "多龍巴魯托",
  "Tyranitar": "班基拉斯",
  "Dragonite": "快龍",
  "Gengar": "耿鬼",
  "Empoleon": "帝王拿波",
  "Scizor": "巨鉗螳螂",
  "Lucario": "路卡利歐",

  "Flamethrower": "噴射火焰",
  "flamethrower": "噴射火焰",
  "Eruption": "噴火",
  "eruption": "噴火",
  "Heat Wave": "熱風",
  "heatwave": "熱風",
  "Fire Blast": "大字爆炎",
  "fireblast": "大字爆炎",
  "Solar Beam": "日光束",
  "solarbeam": "日光束",
  "Air Slash": "空氣斬",
  "airslash": "空氣斬",
  "Earthquake": "地震",
  "earthquake": "地震",
  "Aqua Jet": "水流噴射",
  "aquajet": "水流噴射",
  "Moonblast": "月亮之力",
  "moonblast": "月亮之力",
  "Thunderbolt": "十萬伏特",
  "thunderbolt": "十萬伏特",
  "Hydro Pump": "水炮",
  "hydropump": "水炮",
  "Ice Beam": "冰凍光束",
  "icebeam": "冰凍光束",
  "Sludge Bomb": "污泥炸彈",
  "sludgebomb": "污泥炸彈",
  "Giga Drain": "終極吸取",
  "gigadrain": "終極吸取",
  "Flower Trick": "千變萬花",
  "flowertrick": "千變萬花",
  "Protect": "守住",
  "protect": "守住",

  "Drought": "日照",
  "drought": "日照",
  "Thick Fat": "厚脂肪",
  "thickfat": "厚脂肪",
  "Chlorophyll": "葉綠素",
  "chlorophyll": "葉綠素",
  "Swift Swim": "悠游自如",
  "swiftswim": "悠游自如",
  "Drizzle": "降雨",
  "drizzle": "降雨",
  "Levitate": "飄浮",
  "levitate": "飄浮",
  "Mold Breaker": "破格",
  "moldbreaker": "破格",
  "Blaze": "猛火",
  "blaze": "猛火",
  "Overgrow": "茂盛",
  "overgrow": "茂盛",

  "Choice Scarf": "講究圍巾",
  "choicescarf": "講究圍巾",
  "Choice Specs": "講究眼鏡",
  "choicespecs": "講究眼鏡",
  "Choice Band": "講究頭帶",
  "choiceband": "講究頭帶",
  "Life Orb": "生命寶珠",
  "lifeorb": "生命寶珠",
  "Sitrus Berry": "文柚果",
  "sitrusberry": "文柚果",
  "Mystic Water": "神秘水滴",
  "mysticwater": "神秘水滴",
  "Quick Claw": "先制之爪",
  "quickclaw": "先制之爪",

  "Sun": "晴天",
  "Rain": "雨天",
  "Sand": "沙暴",
  "Snow": "雪天",
  "Hail": "冰雹",
  "Singles": "單打",
  "Doubles": "雙打"
};

const SKIP_KEYS = new Set(["engine", "engineVersion", "faster"]);
const SORTED_KEYS = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length);

function localizeText(text) {
  let output = String(text);
  for (const key of SORTED_KEYS) {
    output = output.split(key).join(TERM_MAP[key]);
  }
  output = output
    .replace(/base calculated speed/g, "基礎計算速度")
    .replace(/speed stage/g, "速度階級")
    .replace(/Tailwind x2/g, "順風 x2")
    .replace(/Paralysis x0.5/g, "麻痺 x0.5")
    .replace(/right side/g, "右方")
    .replace(/left side/g, "左方");
  return output;
}

function localizeValue(value, key = "") {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return SKIP_KEYS.has(key) ? value : localizeText(value);
  if (Array.isArray(value)) return value.map((item) => localizeValue(item));
  if (typeof value === "object") {
    const out = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      out[childKey] = localizeValue(childValue, childKey);
    }
    return out;
  }
  return value;
}

function addDisplayFields(payload) {
  if (payload && typeof payload === "object" && payload.faster) {
    payload.fasterDisplay = payload.faster === "left" ? "左方較快" : payload.faster === "right" ? "右方較快" : "同速";
  }
  if (payload && typeof payload === "object") {
    payload.uiLanguage = "zh-Hant-TW";
  }
  return payload;
}

function localizeResponse(payload) {
  return addDisplayFields(localizeValue(payload));
}

module.exports = {localizeResponse, localizeText};
