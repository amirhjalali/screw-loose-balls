#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPaths = process.argv.slice(2).length
  ? process.argv.slice(2).map((entry) => path.resolve(entry))
  : fs.readdirSync(path.join(root, "assets/maps"))
      .filter((entry) => entry.endsWith(".manifest.json"))
      .sort()
      .map((entry) => path.join(root, "assets/maps", entry));

const attackTowers = {
  dart: { name: "Dart", range: 190 },
  bomb: { name: "Bomb", range: 165 },
  sauce: { name: "Hot Sauce", range: 135 },
  missile: { name: "Missile", range: 280 },
  punch: { name: "Punch", range: 150 },
  engineer: { name: "Engineer", range: 180 },
  ice: { name: "Ice", range: 165 }
};

function pngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function segmentLength(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function buildSegments(points) {
  let start = 0;
  return points.slice(0, -1).map((a, index) => {
    const b = points[index + 1];
    const length = segmentLength(a, b);
    const segment = { a, b, start, length };
    start += length;
    return segment;
  });
}

function closestPointOnPath(point, segments) {
  let best = { x: 0, y: 0, distance: Infinity, pathDistance: 0 };
  for (const segment of segments) {
    const [ax, ay] = segment.a;
    const [bx, by] = segment.b;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / (dx * dx + dy * dy)));
    const x = ax + dx * t;
    const y = ay + dy * t;
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < best.distance) {
      best = { x, y, distance, pathDistance: segment.start + t * segment.length };
    }
  }
  return best;
}

let failed = false;

for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const errors = [];
  const warnings = [];

  if (!manifest.id) errors.push("Missing manifest id.");
  const imagePath = manifest.image ? path.join(root, manifest.image) : null;
  if (!manifest.image || !fs.existsSync(imagePath)) {
    errors.push(`Map image does not exist: ${manifest.image}`);
  } else if (manifest.image.endsWith(".png")) {
    const size = pngSize(imagePath);
    if (size && manifest.world && (size.width !== manifest.world.width || size.height !== manifest.world.height)) {
      errors.push(`Map image dimensions ${size.width}x${size.height} do not match world ${manifest.world.width}x${manifest.world.height}.`);
    }
  }
  if (!manifest.guideImage) {
    errors.push("Manifest must include guideImage so generated art has a fixed composition reference.");
  } else if (!fs.existsSync(path.join(root, manifest.guideImage))) {
    errors.push(`Guide image does not exist: ${manifest.guideImage}`);
  }
  if (manifest.artWorkflow) {
    if (manifest.artWorkflow.layoutAuthority !== "manifest") {
      warnings.push("artWorkflow.layoutAuthority should be \"manifest\" so layout stays source-of-truth.");
    }
    if (manifest.artWorkflow.compositionReference && manifest.artWorkflow.compositionReference !== manifest.guideImage) {
      warnings.push(`artWorkflow compositionReference ${manifest.artWorkflow.compositionReference} differs from guideImage ${manifest.guideImage}.`);
    }
  } else {
    warnings.push("Missing artWorkflow metadata for map generation handoff.");
  }
  if (!Array.isArray(manifest.route) || manifest.route.length < 2) {
    errors.push("Route must contain at least two points.");
  }
  if (!Array.isArray(manifest.buildPads) || !manifest.buildPads.length) {
    errors.push("Manifest needs at least one build pad.");
  }

  const width = manifest.world?.width || 0;
  const height = manifest.world?.height || 0;
  const segments = buildSegments(manifest.route || []);
  const computedLength = Math.round(segments.reduce((sum, segment) => sum + segment.length, 0));
  if (Math.abs(computedLength - (manifest.pathLength || 0)) > 2) {
    warnings.push(`pathLength is ${manifest.pathLength}, computed ${computedLength}.`);
  }

  const seenPads = new Set();
  const padSummaries = [];
  for (const pad of manifest.buildPads || []) {
    if (!pad.id) errors.push("Build pad missing id.");
    if (seenPads.has(pad.id)) errors.push(`Duplicate build pad id: ${pad.id}`);
    seenPads.add(pad.id);
    if (pad.x < 0 || pad.x > width || pad.y < 0 || pad.y > height) {
      errors.push(`Build pad ${pad.id} is outside the world bounds.`);
    }
    const closest = closestPointOnPath(pad, segments);
    const rounded = {
      x: Math.round(closest.x),
      y: Math.round(closest.y),
      distance: Math.round(closest.distance),
      pathDistance: Math.round(closest.pathDistance)
    };
    const recorded = pad.nearestPath;
    if (!recorded || Math.abs(recorded.distance - rounded.distance) > 2 || Math.abs(recorded.x - rounded.x) > 2 || Math.abs(recorded.y - rounded.y) > 2) {
      warnings.push(`Build pad ${pad.id} nearestPath differs from computed ${JSON.stringify(rounded)}.`);
    }
    const coverage = Object.values(attackTowers)
      .filter((tower) => tower.range >= closest.distance)
      .map((tower) => tower.name);
    if (!coverage.length) {
      errors.push(`Build pad ${pad.id} cannot reach the path with any common attack tower.`);
    }
    padSummaries.push(`${pad.id}: ${Math.round(closest.distance)}px path distance, ${coverage.join("/")}`);
  }

  if (errors.length) {
    failed = true;
    console.error(`Manifest ${manifest.id || manifestPath} failed validation:`);
    errors.forEach((error) => console.error(`- ${error}`));
    warnings.forEach((warning) => console.warn(`- warning: ${warning}`));
    continue;
  }

  console.log(`Manifest ${manifest.id} ok`);
  console.log(`Route length: ${computedLength}px`);
  console.log(`Build pads: ${manifest.buildPads.length}`);
  padSummaries.forEach((summary) => console.log(`- ${summary}`));
  warnings.forEach((warning) => console.warn(`warning: ${warning}`));
}

if (failed) process.exit(1);
