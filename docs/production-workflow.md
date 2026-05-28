# Screw Loose Balls Production Workflow

These are project rules to keep the game from drifting while new art is generated.

## Parallel Asset Work Rule

Do not wait idle for image generation. When a map, tower sheet, hero ability sheet, or effect sheet is sent to imagegen, keep development moving on tasks that do not depend on the returned pixels: wave data, tower stats, UI layout, validators, prompt cleanup, sprite wiring placeholders, or iPad/PC layout work.

Batch independent imagegen jobs when possible, such as map backgrounds, tower directional sheets, hero ability sheets, and effect sheets. When assets return, do a focused integration pass: crop or chroma-key if needed, create thumbs, set sprite bounds and anchors, wire the paths, then run the project gate.

The full level and asset pipeline lives in `docs/level-and-asset-pipeline.md`.

## Map Generation Rule

Do not paint a procedural road on top of an already-generated map as the final look.

For future maps:

1. Generate the gameplay route and build pad positions first in code.
2. Render a clean guide image with the route, exit, house/garden landmarks, and pad circles.
3. Feed that guide image into GPT Image 2 as the composition reference.
4. Ask GPT Image 2 to paint the map while preserving the route and pad positions.
5. Continue coding or validating while the image generates instead of waiting on the result.
6. In code, use the same route points and pad centers from the guide.
7. Verify every build pad can reach the road with at least one normal attack tower before accepting the map.

Do not draw level furniture, toy blocks, couches, trampolines, or decorative props directly on the gameplay canvas as final art. If a level needs those objects, they belong in the generated map image or in generated sprite assets with explicit placement data.

Each accepted map needs a small manifest:

- route points
- build pad centers
- pad radius and tower ground-anchor expectation
- entrance and exit bounds
- no-build decoration areas
- screenshot/reference image used for generation
- art workflow metadata that names the manifest as the source of truth and the guide image as the composition reference

Current manifests:

- `assets/maps/garden-map-clean-v1.manifest.json`
- `assets/maps/garden-map-clean-v1-guide.png`
- `assets/maps/trampoline-map-v1.manifest.json`
- `assets/maps/trampoline-map-v1-guide.png`
- `assets/maps/house-map-v1.manifest.json`
- `assets/maps/house-map-v1-guide.png`

Level 2 and Level 3 now have generated v1 backgrounds wired through their own manifests. Keep the guide images as the authority for future regeneration or route/pad revisions.

The game also builds a runtime socket report from the manifest-equivalent constants and exposes it as `data-map-socket-report` on the root HTML element. A map is not accepted if any pad has no attack tower coverage.

At runtime, the selected campaign level applies its map manifest before starter towers or enemies are created. That keeps balls, build pads, tower range checks, and the painted map tied to the same route/socket contract.

Use these commands after route or pad changes:

```bash
python3 scripts/render_map_guide.py
node scripts/validate_index_maps.mjs
node scripts/validate_map_manifest.mjs
node scripts/simulate_campaign.mjs
```

The guide image is the composition reference for generated map art. The validators check campaign-to-map links, inline map image paths against manifest JSON, route length, pad bounds, recorded nearest-path data, map/guide image existence, map image dimensions, and common tower path coverage.

Map art prompts live in `docs/map-art-prompts.md`. Use those prompts with the matching guide image when generating final Level 1/2/3 backgrounds.

Use the full project gate before calling a gameplay/art slice done:

```bash
node scripts/check_project.mjs
```

That runs script parsing, asset-reference checks, guide regeneration, index-to-map validation, map manifest validation, first-wave starter balance validation, and full campaign smoke simulation.

## Placement Rule

Every build pad must be useful. A pad is not valid if common towers placed there cannot hit any enemies without upgrades.

Target checks:

- Short-range towers should have a useful position near each part of the route.
- Support towers, especially Radar, need enough radius to cover nearby attacking towers.
- Generated art pads and code pads must match; no invisible or misleading build spots.
- Tower sprite feet/base must land on the socket centerline. If a tower appears to float or drift away from its pad, adjust the sprite anchor or regenerate the pad/map guide instead of moving it by eye.
- Runtime placement hints should be light glows only. Generated map art owns the visible stone/dirt build pads, so the canvas should not redraw heavy socket art over the map.
- Enemy sprite-sheet `anchorY` adjusts draw Y only. It must not shift draw X, or balls will appear to roll beside the path instead of on it.

## Starter Defense Rule

Every campaign level needs a starter-defense list matched to its first wave. If the first wave contains camo, lead, frozen, regrow, or ceramics, the starter list must already include a visible counter or upgraded support tower for that rule.

Use starter upgrades instead of filling every socket. The player should still have open pads and meaningful build choices after Wave 1.

The starter balance validator is `scripts/validate_game_balance.mjs`. It reads the game data from `index.html` and checks that each level's first wave has a starter or hero counter for its enemy types.

The full campaign smoke simulator is `scripts/simulate_campaign.mjs`. It uses the current tower stats, enemy stats, map route coverage, starter towers, wave bonuses, and a conservative auto-buy planner to make sure every wave has plausible counters and damage margins.

## Camera Rule

Gameplay should fill the active screen on iPad and PC. A little cropping is better than large black gutters, but the crop cannot hide the road, exit, starter towers, build pads, or the tower shop.

## Sprite Rule

Major characters and ability effects should use sprite-sheet style assets, not mismatched fallback drawings.

Priority sprites:

- Engineer Adrian tower sheet (generated, transparent, normalized to equal frames before wiring)
- Liam basketball blowback ability sheet (generated, transparent, used for the in-game hero power)
- Hacker Hossein hero icon and downgrade effect sheet (generated, transparent, no baked enemy ball in the effect)
- Radar support tower generated sheet (transparent, four frames minimum: idle, scan pulse, strong pulse, upgraded reveal; loop slowly)
- Dart Tower generated sheet (transparent, four frames minimum: idle, aim left, aim right, twin-dart firing; keep the base aligned across frames)
- Bomb Tower generated sheet (transparent, four frames minimum: idle, aim left, aim right, firing; keep the base aligned across frames)
- Hot Sauce Tower generated sheet (transparent, four frames minimum: idle, aim left, aim right, firing with sauce stream; keep the tank and base aligned)
- Ice Tower generated sheet (transparent, four frames minimum: idle, aim left, aim right, fire; keep it compact, cannon-like, and cropped so the base sits on the socket)
- Missile Tower generated sheet (transparent, four frames minimum: idle, aim left/right, firing; use a visible rocket flare only in the firing frame)
- Punch Tower generated sheet (transparent, four frames minimum: idle, aim left, aim right, piston punch; keep the glove machine compact and grounded)
- Tower attacks and upgrade effects

## Directional Animation Rule

Turrets should react to where enemies are. A final tower sprite sheet should include enough directional frames to avoid a fixed front-facing turret shooting sideways.

Minimum useful tower sheet:

- idle/front
- aim left
- aim right
- firing frame

If a generated sheet already has left and right aim frames, do not also mirror those frames in code. Mirroring is only acceptable for a missing opposite direction, such as the Missile Tower's firing frame until a matching left-fire frame exists.

Better tower sheet:

- 8 directions
- idle and firing row for each direction
- same base footprint and ground anchor in every frame

When a tower is generated from an existing tower image, use that tower as the image reference so the shape, color, base, and silhouette remain consistent across angles.
