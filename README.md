# AJ Things' Screw Loose Balls

A silly, slapstick 2D tower defense game that runs entirely in the browser. Loose-screw balls roll out of the house, through the garden, and try to escape — your job is to stop them with darts, bombs, hot sauce, an engineer named Adrian, and two heroes (Liam the basketball player and Hacker Hossein).

**Play it locally:** open `index.html` in a modern browser. No build step required.

## Features

- **Three-level campaign** — Garden Trail → Trampoline Bounce → Inside the House
- **8 towers** — Dart, Bomb, Hot Sauce, Engineer Adrian, Punch, Ice, Missile, Beacon/Radar
- **2 heroes** with cooldown abilities — Liam (basketball blowback that strips regrow), Hacker Hossein (downgrade newest ball)
- **7 enemy ball types** — Normal, Lead, Ceramic, Camouflage, Frozen, Regrow, plus airship bosses and mixed variants (Camo-Regrow, Camo-Lead, Camo-Ceramic, Regrow-Lead, Regrow-Ceramic)
- **Tower upgrades** — 3 upgrade paths per tower with persistent pip indicators
- **Star ratings** saved per level, difficulty selector, mute toggle, speed control
- **iPad-friendly HUD** — large build pads, compact wave preview, toast status messages

## Project Structure

```
.
├── index.html                  # The entire game (single-file canvas + DOM HUD)
├── assets/
│   ├── characters/             # Liam hero art
│   ├── concepts/               # Concept and poster art
│   ├── infographics/           # Rules infographic
│   ├── intro/final/            # Intro video (mp4) + end card
│   ├── maps/                   # Per-level map images and JSON manifests
│   └── sprites/                # Enemy, tower, hero, and effect sprite sheets
├── docs/
│   ├── game-rules.md           # Living rules document
│   ├── level-and-asset-pipeline.md
│   ├── map-art-prompts.md      # GPT Image 2 prompts for map regeneration
│   └── production-workflow.md
└── scripts/                    # Validation and simulation tooling
    ├── check_project.mjs       # Master validator
    ├── simulate_campaign.mjs   # Conservative auto-buy campaign smoke
    ├── validate_game_balance.mjs
    ├── validate_index_maps.mjs
    ├── validate_map_manifest.mjs
    └── render_map_guide.py     # Renders route/socket overlay guide images
```

## Running the validators

```bash
node scripts/check_project.mjs
```

Runs all checks: campaign simulation, balance validation, map manifest validation, and index/map sync.

## License

MIT — see [LICENSE](LICENSE).
