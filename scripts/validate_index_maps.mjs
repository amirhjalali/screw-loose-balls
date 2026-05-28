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

const mapKeys = [...script.matchAll(/^\s{6}([a-zA-Z0-9_-]+): \{\n\s+\.\.\.baseMapContract,/gm)].map((match) => match[1]);
const levelMapIds = [...script.matchAll(/mapId: "([^"]+)"/g)].map((match) => match[1]);
const errors = [];

if (!mapKeys.length) errors.push("No mapManifests entries found in index.html.");
if (!levelMapIds.length) errors.push("No campaign level mapId entries found in index.html.");

const mapKeySet = new Set(mapKeys);
for (const mapId of levelMapIds) {
  if (!mapKeySet.has(mapId)) errors.push(`Campaign level references missing mapId: ${mapId}`);
}

for (const key of mapKeys) {
  const block = blockForMapKey(key);
  const image = quotedField(block, "image");
  const manifestPath = quotedField(block, "manifest");
  if (!image) errors.push(`Map ${key} is missing inline image path.`);
  if (!manifestPath) errors.push(`Map ${key} is missing manifest path.`);
  if (image && !fs.existsSync(path.join(root, image))) errors.push(`Map ${key} inline image does not exist: ${image}`);
  if (manifestPath && !fs.existsSync(path.join(root, manifestPath))) {
    errors.push(`Map ${key} manifest does not exist: ${manifestPath}`);
    continue;
  }
  if (manifestPath) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
    if (manifest.image !== image) {
      errors.push(`Map ${key} inline image ${image} does not match manifest image ${manifest.image}.`);
    }
    if (!Array.isArray(manifest.route) || manifest.route.length < 2) {
      errors.push(`Map ${key} manifest has no usable route.`);
    }
    if (!Array.isArray(manifest.buildPads) || !manifest.buildPads.length) {
      errors.push(`Map ${key} manifest has no build pads.`);
    }
  }
}

if (errors.length) {
  console.error("Index map validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Index map validation ok (${mapKeys.length} maps, ${levelMapIds.length} campaign links)`);
