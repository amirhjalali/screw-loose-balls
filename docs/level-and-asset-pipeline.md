# Screw Loose Balls Level And Asset Pipeline

This is the rulebook for making future levels and generated assets without losing gameplay accuracy.

## Core Rule

Gameplay layout is the source of truth. Generated art must fit the layout, not the other way around.

The route, build pads, entrance, exit, range checks, and tower ground anchors are decided first in the map manifest. The guide image is only a visual rendering of that manifest. GPT Image 2 should use the guide image as the composition reference and preserve it.

## Map Pipeline

1. Create or edit the level manifest route and build pads.
2. Run `python3 scripts/render_map_guide.py` to render the guide screenshot from that exact data.
3. Run `node scripts/validate_map_manifest.mjs` to catch useless pads, missing guide art, and bad map dimensions.
4. Send the guide image plus the prompt from `docs/map-art-prompts.md` to GPT Image 2.
5. While the map image is generating, keep working on code, waves, UI, validators, sprite wiring, or the next prompt.
6. When the generated image returns, reject it if the road, sockets, entrance, or exit drift from the guide.
7. Only after the map passes visual review, wire the image path into the manifest and run `node scripts/check_project.mjs`.

Never paint a second road on top of a finished generated map. If the road is wrong, regenerate the map from the guide.

## Parallel Asset Rule

Do not wait idle for image generation.

When starting imagegen work, launch independent asset jobs as a batch when possible:

- map background art from guide images
- tower directional sprite sheets
- hero ability sprite sheets
- effect sprite sheets
- UI poster or infographic art

Then immediately continue development on work that does not depend on the returned pixels:

- tower stats, upgrade data, cooldowns, and wave rules
- placeholder asset references and dimensions
- validators and acceptance checks
- route and build pad manifests
- iPad and PC layout fixes
- documentation and prompt cleanup

When assets return, process them in a short integration pass: crop or chroma-key if needed, make thumbs, set sprite bounds and ground anchors, wire paths, then run the full project gate.

## Sprite Sheet Acceptance

Generated sprite sheets are accepted only if they are usable in game, not merely nice-looking.

- Every frame must keep the same base footprint.
- Towers must sit on the build socket instead of floating.
- Directional towers need left/right or multi-direction aim frames.
- Hero ability sheets must be scaled to gameplay size and face the enemy group.
- Sprite sheets should have clear transparent or removable backgrounds.
- If an asset has the wrong pose, wrong size, wrong angle, or wrong identity, regenerate it from a better prompt/reference instead of patching it with canvas drawings.

## Level Layout Acceptance

A level layout is not accepted until:

- every pad can hit the path with at least one common attack tower
- support towers such as Radar have meaningful coverage
- balls visually roll on the route centerline
- generated sockets match code pad centers
- the exit and entrance are visible on iPad and PC
- no decorative art blocks the road, sockets, or tower bases

## Current Command Gate

Use this before calling a playable slice done:

```bash
node scripts/check_project.mjs
```
