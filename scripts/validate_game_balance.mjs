#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

if (!script) {
  console.error("Could not find the inline game script in index.html.");
  process.exit(1);
}

function extractBlock(startMarker, endMarker) {
  const start = script.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing marker: ${startMarker}`);
  const exprStart = start + startMarker.length;
  const end = script.indexOf(endMarker, exprStart);
  if (end === -1) throw new Error(`Missing end marker after ${startMarker}: ${endMarker}`);
  return script.slice(exprStart, end).trim().replace(/;$/, "");
}

function evalExpression(expression, args = {}) {
  return Function(...Object.keys(args), `return (${expression});`)(...Object.values(args));
}

const towerTypes = evalExpression(extractBlock("const towerTypes = ", "\n\n    const baseMapContract"));
const upgradePaths = evalExpression(extractBlock("const upgradePaths = ", "\n\n    const waveConfigs"));
const waveConfigs = evalExpression(extractBlock("const waveConfigs = ", "\n    const campaignLevels"));
const campaignLevels = evalExpression(
  extractBlock("const campaignLevels = ", "\n    const speedOptions"),
  { waveConfigs }
);
const enemyTypes = evalExpression(extractBlock("const enemyTypes = ", "\n\n    const enemySpriteSheet"));

function getTowerStats(tower) {
  const base = towerTypes[tower.id];
  const levels = tower.upgrades || [0, 0, 0];
  const stats = {
    ...base,
    range: base.range,
    rate: base.rate,
    damage: base.damage,
    splash: base.splash || 0,
    shots: 1,
    knockback: 0,
    radar: false,
    regrowBlock: false,
    universalSupport: false,
    canHitSharpImmune: false,
    alwaysHitFrozen: false,
    cleansingFoam: false,
    airshipPartRemoval: false,
    overclockProvider: false,
    sentryCount: 0,
    freezeDuration: 0,
    freezeSlow: 1,
    snap: false
  };

  if (tower.id === "dart") {
    stats.rate *= Math.pow(0.84, levels[0]);
    stats.damage += levels[1] * 0.45;
    stats.shots += levels[2];
  } else if (tower.id === "bomb") {
    stats.splash += levels[0] * 28;
    stats.damage += levels[1] * 0.9;
    stats.rate *= Math.pow(0.84, levels[2]);
  } else if (tower.id === "sauce") {
    stats.damage += levels[0] * 0.28;
    stats.range += levels[1] * 26;
    stats.rate *= Math.pow(0.82, levels[2]);
  } else if (tower.id === "missile") {
    stats.range += levels[0] * 42;
    stats.damage += levels[1] * 1.1;
    stats.alwaysHitFrozen = levels[2] > 0;
  } else if (tower.id === "beacon") {
    stats.range += levels[0] * 62;
    stats.regrowBlock = levels[1] > 0;
    stats.universalSupport = levels[1] >= 3;
    stats.radar = levels[2] > 0;
  } else if (tower.id === "punch") {
    stats.rate *= Math.pow(0.82, levels[0]);
    stats.damage += levels[1] * 0.4;
    stats.knockback = levels[2] * 28;
  } else if (tower.id === "engineer") {
    stats.range += levels[0] * 36;
    stats.sentryCount = levels[0] >= 2 ? 2 : 0;
    stats.shots += stats.sentryCount;
    stats.overclockProvider = levels[0] >= 3;
    stats.damage += levels[1] * 0.45;
    if (levels[1] >= 2) stats.rate *= 0.82;
    stats.airshipPartRemoval = levels[1] >= 3;
    stats.cleansingFoam = levels[2] > 0;
    if (levels[2] >= 2) stats.range += 28;
    if (levels[2] >= 3) stats.radar = true;
  } else if (tower.id === "ice") {
    stats.range += levels[0] * 42;
    stats.freezeDuration = 1.9 + levels[1] * 0.95;
    stats.freezeSlow = Math.max(0.16, 0.46 - levels[1] * 0.08);
    stats.snap = levels[1] >= 3;
    stats.damage += levels[2] * 0.38;
    if (levels[2] >= 3) stats.shots += 1;
  }

  stats.rate = Math.max(0.12, stats.rate);
  return stats;
}

function hasRadar(starters) {
  return starters.some((starter) => {
    const stats = getTowerStats(starter);
    return stats.radar || (starter.id === "beacon" && stats.radar);
  });
}

function hasRegrowCounter(starters) {
  const liamHeroAvailable = true;
  return liamHeroAvailable || starters.some((starter) => {
    const stats = getTowerStats(starter);
    return starter.id === "engineer" && stats.cleansingFoam || starter.id === "beacon" && stats.regrowBlock;
  });
}

function towerCanHitEnemy(starter, enemyType, starters) {
  const stats = getTowerStats(starter);
  const enemy = enemyTypes[enemyType];
  const traits = enemy?.traits || [];
  if (!enemy || stats.type === "support") return false;
  if (traits.includes("camouflage") && !hasRadar(starters) && !(stats.type === "ice" && stats.snap)) return false;
  if (stats.type === "sharp" && traits.includes("sharpImmune") && !stats.canHitSharpImmune) return false;
  if (stats.type === "ice") {
    if (traits.includes("iceImmune")) return false;
    if ((traits.includes("sharpImmune") || traits.includes("camouflage")) && !stats.snap) return false;
  }
  if (stats.type === "missile" && traits.includes("ice") && !stats.alwaysHitFrozen) return false;
  return true;
}

function starterFromConfig(config) {
  return (config.starterTowers || []).map((starter) => ({
    id: starter.tower,
    padId: starter.pad,
    upgrades: [0, 0, 0].map((_, index) => Math.max(0, Math.min(3, starter.upgrades?.[index] || 0)))
  }));
}

const errors = [];
const warnings = [];

for (const level of campaignLevels) {
  if (!level.starterTowers?.length) {
    errors.push(`${level.name} has no starter towers.`);
    continue;
  }
  const starters = starterFromConfig(level);
  for (const starter of starters) {
    if (!towerTypes[starter.id]) errors.push(`${level.name} starter uses unknown tower: ${starter.id}`);
    if (!upgradePaths[starter.id]) errors.push(`${level.name} starter missing upgrade path for tower: ${starter.id}`);
  }

  const firstWave = level.waves?.[0];
  if (!firstWave?.enemies?.length) {
    errors.push(`${level.name} has no first wave enemies.`);
    continue;
  }

  const firstWaveTypes = [...new Set(firstWave.enemies)];
  for (const typeId of firstWaveTypes) {
    if (!enemyTypes[typeId]) {
      errors.push(`${level.name} first wave uses unknown enemy: ${typeId}`);
      continue;
    }
    const hitters = starters.filter((starter) => towerCanHitEnemy(starter, typeId, starters));
    if (!hitters.length) {
      errors.push(`${level.name} first wave ${typeId} has no starter counter.`);
    }
  }

  const firstWaveThreats = firstWaveTypes.flatMap((typeId) => enemyTypes[typeId]?.traits || []);
  if (firstWaveThreats.includes("camouflage") && !hasRadar(starters)) {
    errors.push(`${level.name} first wave has camo but no starter radar.`);
  }
  if (firstWaveThreats.includes("regrow") && !hasRegrowCounter(starters)) {
    warnings.push(`${level.name} first wave has regrow but no starter foam/regrow-block support.`);
  }
}

if (errors.length) {
  console.error("Game balance validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  warnings.forEach((warning) => console.warn(`warning: ${warning}`));
  process.exit(1);
}

console.log("Game balance validation ok");
for (const level of campaignLevels) {
  const starters = starterFromConfig(level)
    .map((starter) => `${starter.id}@${starter.padId}:${starter.upgrades.join(".")}`)
    .join(", ");
  const wave = level.waves[0];
  console.log(`- ${level.name}: ${level.starterTowers.length} starters cover ${[...new Set(wave.enemies)].join(", ")} (${starters})`);
}
warnings.forEach((warning) => console.warn(`warning: ${warning}`));
