# Screw Loose Balls Map Art Prompts

Use these prompts with GPT Image 2 after attaching the matching route/socket guide image. The generated map must preserve the guide geometry exactly enough that the code route and build pads still match the painted art.

## Workflow

The manifest is the source of truth. Before asking GPT Image 2 for a map, render the guide with `python3 scripts/render_map_guide.py` and attach that guide image to the prompt. While the image generates, continue development on code, validation, waves, UI, or other independent assets.

Do not accept a generated map by moving code points to fit the art. If the road, sockets, entrance, or exit drift from the guide, reject the image and regenerate from the guide.

## Shared Requirements

- Landscape game map, 1619 by 972 composition.
- Bright polished 2D tower defense game art.
- Preserve the road centerline, road width, entrance, exit, and every circular build socket from the guide image.
- Keep all seven socket platforms visible, grounded, and empty.
- Do not move, rotate, resize, hide, or repaint sockets in different positions.
- Do not place furniture, boxes, toys, plants, rocks, fences, trampolines, or other props over the road or sockets.
- Leave enough clear playable grass/floor around each socket for towers to sit naturally.
- No UI, no labels, no text, no characters, no enemies, no towers.

## Level 1 Garden Trail

Reference guide: `assets/maps/garden-map-clean-v1-guide.png`

Prompt:

```text
Use the attached guide as the exact composition reference for a polished 2D tower defense map.
Paint a cheerful backyard garden trail for AJ Things' Screw Loose Balls.
The path is a warm dirt road rolling from the left entrance to the glowing stone exit on the right.
Preserve the route, entrance, exit, and all seven build socket positions exactly from the guide.
Add generated garden details around the playable spaces: flowers, bushes, small rocks, wood fence pieces, soft grass texture, and bright outdoor lighting.
Keep every socket as a clean grounded circular stone platform with clear space around it.
Do not add UI, labels, towers, balls, people, pets, furniture, boxes, or props over the road or sockets.
```

## Level 2 Trampoline Bounce

Reference guide: `assets/maps/trampoline-map-v1-guide.png`

Prompt:

```text
Use the attached guide as the exact composition reference for a polished 2D tower defense map.
Paint a fun backyard trampoline level for AJ Things' Screw Loose Balls.
The path is a tan garden trail that winds from the left entrance to the glowing exit on the right.
Preserve the route, entrance, exit, and all seven build socket positions exactly from the guide.
Add a colorful trampoline, backyard play details, flowers, bushes, and fence pieces only in open non-playable spaces away from the road and sockets.
The trampoline should feel important to the level but must not cover the road, sockets, or tower placement space.
Keep every socket as a clean grounded circular stone platform with clear space around it.
No UI, no labels, no towers, no balls, no people, no random furniture, no boxes, and no props over the road or sockets.
```

## Level 3 Inside The House

Reference guide: `assets/maps/house-map-v1-guide.png`

Prompt:

```text
Use the attached guide as the exact composition reference for a polished 2D tower defense map.
Paint a cozy inside-the-house level for AJ Things' Screw Loose Balls.
The path is a playful rolling trail through the house from the left entrance to the glowing exit on the right.
Preserve the route, entrance, exit, and all seven build socket positions exactly from the guide.
Add warm house details around the playable spaces: wood floor, rugs, wall trim, toy shelves, pillows, and room decorations, but only where they do not cover the road or sockets.
The level should read clearly as inside a house while still being clean and playable on iPad.
Keep every socket as a clean grounded circular platform with clear space around it.
No UI, no labels, no towers, no balls, no people, no pets, no floating props, no random couches blocking gameplay, and no props over the road or sockets.
```

## Acceptance Check

After generating a map, update its manifest `image` path, then run:

```bash
node scripts/check_project.mjs
```

Reject the map if the painted road no longer matches the route, if sockets drift from their guide positions, or if tower bases appear to float above the socket platforms.
