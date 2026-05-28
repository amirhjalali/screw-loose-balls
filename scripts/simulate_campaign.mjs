#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
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

function blockForMapKey(key) {
  const start = script.indexOf(`      ${key}: {`);
  if (start === -1) return "";
  const rest = script.slice(start);
  const nextKey = rest.slice(1).search(/\n      [a-zA-Z0-9_-]+: \{/);
  const end = nextKey === -1 ? rest.indexOf("\n    };") : nextKey + 1;
  return end === -1 ? rest : rest.slice(0, end);
}

function quotedField(block, field) {
  return block.match(new RegExp(`${field}: "([^"]+)"`))?.[1] || "";
}

const towerTypes = evalExpression(extractBlock("const towerTypes = ", "\n\n    const baseMapContract"));
const upgradePaths = evalExpression(extractBlock("const upgradePaths = ", "\n\n    const waveConfigs"));
const waveConfigs = evalExpression(extractBlock("const waveConfigs = ", "\n    const campaignLevels"));
const campaignLevels = evalExpression(
  extractBlock("const campaignLevels = ", "\n    const speedOptions"),
  { waveConfigs }
);
const enemyTypes = evalExpression(extractBlock("const enemyTypes = ", "\n\n    const enemySpriteSheet"));
const mapKeys = [...script.matchAll(/^\s{6}([a-zA-Z0-9_-]+): \{\n\s+\.\.\.baseMapContract,/gm)].map((match) => match[1]);
const mapManifests = Object.fromEntries(mapKeys.map((key) => {
  const manifestPath = quotedField(blockForMapKey(key), "manifest");
  return [key, JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"))];
}));

function segmentLength(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function pathLength(route) {
  return route.slice(0, -1).reduce((sum, point, index) => sum + segmentLength(point, route[index + 1]), 0);
}

function pointOnPath(route, distance) {
  let remaining = distance;
  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i];
    const b = route[i + 1];
    const length = segmentLength(a, b);
    if (remaining <= length) {
      const t = length ? remaining / length : 0;
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t };
    }
    remaining -= length;
  }
  const last = route[route.length - 1];
  return { x: last[0], y: last[1] };
}

function routeCoverage(pad, range, manifest) {
  const length = pathLength(manifest.route);
  let covered = 0;
  const samples = 180;
  for (let i = 0; i < samples; i += 1) {
    const point = pointOnPath(manifest.route, length * ((i + 0.5) / samples));
    if (Math.hypot(point.x - pad.x, point.y - pad.y) <= range) covered += 1;
  }
  return covered / samples;
}

function upgradeCost(tower, pathIndex) {
  const info = upgradePaths[tower.id][pathIndex];
  const level = tower.upgrades[pathIndex];
  return Math.round(info.cost * (1 + level * 0.68));
}

function upgradeCostTo(id, upgrades) {
  const tower = { id, upgrades: [0, 0, 0] };
  let total = towerTypes[id].cost;
  for (let pathIndex = 0; pathIndex < 3; pathIndex += 1) {
    while (tower.upgrades[pathIndex] < (upgrades[pathIndex] || 0)) {
      total += upgradeCost(tower, pathIndex);
      tower.upgrades[pathIndex] += 1;
    }
  }
  return total;
}

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

function hasBeaconEffect(tower, effectName, defense) {
  return defense.towers.some((beacon) => {
    if (beacon.id !== "beacon") return false;
    const stats = getTowerStats(beacon);
    return Boolean(stats[effectName]) && Math.hypot(beacon.x - tower.x, beacon.y - tower.y) <= stats.range;
  });
}

function hasRadar(defense) {
  return defense.towers.some((tower) => {
    const stats = getTowerStats(tower);
    return stats.radar || (tower.id !== "beacon" && hasBeaconEffect(tower, "radar", defense));
  });
}

function hasRegrowSupport(defense) {
  return defense.towers.some((tower) => {
    const stats = getTowerStats(tower);
    return stats.regrowBlock || stats.cleansingFoam;
  });
}

function canTowerHitEnemy(tower, typeId, defense) {
  const stats = getTowerStats(tower);
  const enemy = enemyTypes[typeId];
  const traits = enemy?.traits || [];
  if (!enemy || stats.type === "support") return false;
  if (hasBeaconEffect(tower, "universalSupport", defense)) return true;
  if (traits.includes("camouflage") && !hasRadar(defense) && !(stats.type === "ice" && stats.snap)) return false;
  if (stats.type === "sharp" && traits.includes("sharpImmune") && !stats.canHitSharpImmune) return false;
  if (stats.type === "ice") {
    if (traits.includes("iceImmune")) return false;
    if ((traits.includes("sharpImmune") || traits.includes("camouflage")) && !stats.snap) return false;
  }
  return true;
}

function effectiveHp(typeId, defense) {
  const enemy = enemyTypes[typeId];
  let hp = enemy.hp;
  if ((enemy.traits || []).includes("regrow") && !hasRegrowSupport(defense)) hp += 1.25;
  if ((enemy.traits || []).includes("airship")) {
    hp += (enemy.drops || []).reduce((sum, drop) => sum + effectiveHp(drop, defense), 0) * 0.5;
  }
  return hp;
}

function towerDamageAgainst(tower, typeId, defense, manifest) {
  if (!canTowerHitEnemy(tower, typeId, defense)) return 0;
  const enemy = enemyTypes[typeId];
  const stats = getTowerStats(tower);
  const coverage = routeCoverage(tower, stats.range, manifest);
  if (coverage <= 0) return 0;
  const timeInRange = (coverage * pathLength(manifest.route)) / enemy.speed;
  let hits = Math.max(0, timeInRange / stats.rate) * stats.shots;
  let damage = hits * stats.damage;
  if (stats.splash) damage *= 1.12;
  if ((enemy.traits || []).includes("ice") && stats.type === "missile" && !stats.alwaysHitFrozen) damage *= 0.55;
  if ((enemy.traits || []).includes("airship") && stats.airshipPartRemoval) damage *= 2.45;
  if (stats.knockback) damage *= 1 + Math.min(0.35, stats.knockback / 180);
  if (stats.type === "ice" && stats.freezeDuration) damage *= 1.05;
  return damage;
}

function waveTypes(wave) {
  return [...new Set(wave.enemies)];
}

function waveScore(defense, wave, manifest) {
  return waveTypes(wave).reduce((sum, typeId) => {
    const hp = effectiveHp(typeId, defense);
    const damage = defense.towers.reduce((total, tower) => total + towerDamageAgainst(tower, typeId, defense, manifest), 0);
    const count = wave.enemies.filter((enemy) => enemy === typeId).length;
    return sum + Math.min(2.2, damage / hp) * count;
  }, 0);
}

function buildTower(id, pad, upgrades = [0, 0, 0]) {
  return {
    id,
    padId: pad.id,
    x: pad.x,
    y: pad.y,
    upgrades: [...upgrades]
  };
}

function emptyPads(defense, manifest) {
  const occupied = new Set(defense.towers.map((tower) => tower.padId));
  return manifest.buildPads.filter((pad) => !occupied.has(pad.id));
}

const buildPackages = [
  { id: "dart", upgrades: [1, 1, 1] },
  { id: "bomb", upgrades: [1, 1, 1] },
  { id: "sauce", upgrades: [1, 1, 1] },
  { id: "missile", upgrades: [1, 1, 1] },
  { id: "missile", upgrades: [0, 0, 1] },
  { id: "beacon", upgrades: [1, 1, 1] },
  { id: "beacon", upgrades: [0, 0, 1] },
  { id: "punch", upgrades: [1, 1, 1] },
  { id: "engineer", upgrades: [2, 1, 1] },
  { id: "engineer", upgrades: [0, 0, 1] },
  { id: "ice", upgrades: [1, 3, 1] },
  { id: "ice", upgrades: [1, 1, 1] }
];

function cloneDefense(defense) {
  return {
    coins: defense.coins,
    towers: defense.towers.map((tower) => ({ ...tower, upgrades: [...tower.upgrades] }))
  };
}

function planPurchases(defense, wave, manifest) {
  let iterations = 0;
  while (iterations < 40) {
    iterations += 1;
    const baseScore = waveScore(defense, wave, manifest);
    let best = null;

    for (const pad of emptyPads(defense, manifest)) {
      for (const pkg of buildPackages) {
        const cost = upgradeCostTo(pkg.id, pkg.upgrades);
        if (cost > defense.coins) continue;
        const candidate = cloneDefense(defense);
        candidate.coins -= cost;
        candidate.towers.push(buildTower(pkg.id, pad, pkg.upgrades));
        const score = waveScore(candidate, wave, manifest);
        const gain = score - baseScore;
        if (gain > 0.05 && (!best || gain / cost > best.value)) {
          best = { value: gain / cost, apply: () => {
            defense.coins -= cost;
            defense.towers.push(buildTower(pkg.id, pad, pkg.upgrades));
          } };
        }
      }
    }

    for (let towerIndex = 0; towerIndex < defense.towers.length; towerIndex += 1) {
      const tower = defense.towers[towerIndex];
      for (let pathIndex = 0; pathIndex < 3; pathIndex += 1) {
        if (tower.upgrades[pathIndex] >= 3) continue;
        const cost = upgradeCost(tower, pathIndex);
        if (cost > defense.coins) continue;
        const candidate = cloneDefense(defense);
        candidate.coins -= cost;
        candidate.towers[towerIndex].upgrades[pathIndex] += 1;
        const score = waveScore(candidate, wave, manifest);
        const gain = score - baseScore;
        if (gain > 0.05 && (!best || gain / cost > best.value)) {
          best = { value: gain / cost, apply: () => {
            defense.coins -= cost;
            tower.upgrades[pathIndex] += 1;
          } };
        }
      }
    }

    if (!best) break;
    best.apply();
  }
}

function waveReport(defense, wave, manifest) {
  return waveTypes(wave).map((typeId) => {
    const hp = effectiveHp(typeId, defense);
    const damage = defense.towers.reduce((total, tower) => total + towerDamageAgainst(tower, typeId, defense, manifest), 0);
    return { typeId, hp, damage, margin: damage / hp };
  });
}

function starterDefense(level, manifest) {
  const towers = (level.starterTowers || []).map((starter) => {
    const pad = manifest.buildPads.find((entry) => entry.id === starter.pad);
    return buildTower(starter.tower, pad, [0, 0, 0].map((_, index) => Math.max(0, Math.min(3, starter.upgrades?.[index] || 0))));
  });
  return { coins: level.startCoins, towers };
}

const errors = [];
const summaries = [];

for (const level of campaignLevels) {
  const manifest = mapManifests[level.mapId || level.id];
  if (!manifest) {
    errors.push(`${level.name} has no map manifest for ${level.mapId || level.id}.`);
    continue;
  }
  const defense = starterDefense(level, manifest);
  const levelLines = [];
  for (let waveIndex = 0; waveIndex < level.waves.length; waveIndex += 1) {
    const wave = level.waves[waveIndex];
    planPurchases(defense, wave, manifest);
    const report = waveReport(defense, wave, manifest);
    const failures = report.filter((entry) => entry.margin < 1.05);
    if (failures.length) {
      errors.push(`${level.name} wave ${waveIndex + 1} (${wave.name}) weak counters: ${failures.map((entry) => `${entry.typeId} ${entry.margin.toFixed(2)}x`).join(", ")}`);
    }
    levelLines.push(`W${waveIndex + 1} ${wave.name}: ${defense.towers.length} towers, $${Math.floor(defense.coins)} left, lowest ${Math.min(...report.map((entry) => entry.margin)).toFixed(2)}x`);
    defense.coins += wave.bonus || 0;
  }
  summaries.push({ level: level.name, lines: levelLines });
}

if (errors.length) {
  console.error("Campaign smoke simulation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Campaign smoke simulation ok");
summaries.forEach((summary) => {
  console.log(`- ${summary.level}`);
  summary.lines.forEach((line) => console.log(`  ${line}`));
});
