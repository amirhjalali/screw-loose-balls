#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const label = [command, ...args].join(" ");
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8"
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`check failed: ${label}`);
    process.exit(result.status || 1);
  }
}

function checkInlineScriptParse() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  if (!script) {
    console.error("index.html has no inline game script.");
    process.exit(1);
  }
  new Function(script);
  console.log("script parse ok");
}

function checkAssetRefs() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src="|sprite: "|thumb: "|image: "|poster="|manifest: ")([^"]+)/g)]
    .map((match) => match[1])
    .filter((ref) => ref.startsWith("assets/"));
  const missing = [...new Set(refs)].filter((ref) => !fs.existsSync(path.join(root, ref)));
  if (missing.length) {
    console.error("Missing asset references:");
    missing.forEach((ref) => console.error(`- ${ref}`));
    process.exit(1);
  }
  console.log("asset refs ok");
}

function checkEnemySpriteAnchor() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const block = html.match(/function drawEnemySpriteFrame[\s\S]*?return true;\n    }/)?.[0];
  if (!block) {
    console.error("drawEnemySpriteFrame not found.");
    process.exit(1);
  }
  if (block.includes("const drawX = -drawSize / 2 + anchorY")) {
    console.error("Enemy sprite anchorY is incorrectly applied to drawX.");
    process.exit(1);
  }
  if (!block.includes("const drawX = -drawSize / 2;") || !block.includes("const drawY = -drawSize / 2 + anchorY;")) {
    console.error("Enemy sprite anchor contract changed. anchorY must adjust drawY only.");
    process.exit(1);
  }
  console.log("enemy sprite anchor ok");
}

checkInlineScriptParse();
checkAssetRefs();
checkEnemySpriteAnchor();
run("python3", ["scripts/render_map_guide.py"]);
run("node", ["scripts/validate_index_maps.mjs"]);
run("node", ["scripts/validate_map_manifest.mjs"]);
run("node", ["scripts/validate_game_balance.mjs"]);
run("node", ["scripts/simulate_campaign.mjs"]);
console.log("project checks ok");
