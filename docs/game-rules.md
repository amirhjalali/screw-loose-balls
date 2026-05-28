# AJ Things' Screw Loose Balls - Game Rules

This is the living rules document for the tower defense game idea. Add new rules here as Adrian invents them.

## Core Idea

AJ Things' Screw Loose Balls is a funny tower defense game, not a spooky one.

The intro starts inside a house. Lots of loose-screw balls roll through the house, go out to the garden, follow a trail, and try to reach an exit. If too many balls get through the exit, the player loses lives.

The player uses towers, machines, heroes, pets, upgrades, and silly powers to stop the balls.

## Main Map Flow

- Balls follow paths toward an exit.
- The game can have several paths for towers and enemies to deal with.
- If balls reach the exit, the player loses lives.
- After the player defeats a big group of balls, an airship can appear.
- The airship takes several hits and drops ceramic balls.

## Level Map

The levels are actually a map of the house.

Known levels:

- Level 1: out in the garden
- Level 2: trampoline level
- Level 3: inside the house
- More levels can be added later

Current playable slice:

- The game now has a three-level campaign: Garden Trail, Trampoline Bounce, and Inside The House.
- Winning a level unlocks the next level automatically.
- Finished levels save a best star rating based on remaining lives.
- Each level has its own wave list, starting money, map tint, boss mix, and map manifest.
- Level-specific props are no longer drawn as canvas placeholders. Future trampoline, house, furniture, toys, and room details must be part of generated map art.
- The HUD shows a compact next-wave preview with enemy icons and counts before each wave starts.
- The wave preview also shows short counter hints for threats like lead, camo, frozen, regrow, ceramics, fortified balls, and airships, but stays compact enough to avoid hiding key starter towers.
- Gameplay status messages appear as compact toast messages and fade away during active play so they do not cover the board.
- Enemy balls use path-centered sprite anchors and ground shadows so they look like they are rolling on the trail.
- Enemy sprite-sheet vertical anchoring must only move the sprite up/down; it cannot move the ball sideways off the route.
- The painted map road is used directly; do not draw a heavy road on top of generated map art.
- Empty build pads are larger, glowing, and use plus-shaped sockets so they are easier to tap on iPad.
- Current build pads were moved closer to the playable route so bottom-side towers can reach enemies.
- Each campaign level has a JSON manifest with route points, build socket centers, path distances, entrance/exit bounds, and ground-anchor expectations.
- Each campaign level also has a rendered route/socket guide image for future GPT Image 2 map generation.
- Current playable slice: Level 2 and Level 3 are wired to generated v1 map backgrounds through their own manifests and guide images.
- Current playable slice: selecting or starting a level applies that level's map manifest before starter towers, build pads, range checks, and enemies are created.
- The game validates build sockets at startup and exposes a map socket report so bad pads are caught before new generated maps are accepted.
- The camera fills wide PC and iPad-landscape screens instead of leaving black side gutters, while keeping the road, pads, and starter towers visible.
- Starter defenses use visible pads so the player immediately sees the Dart, Bomb, and Engineer setup.
- Starter defenses are level-specific. Later levels begin with upgraded counters such as Radar, Engineer foam/sentries, and Snap Ice so the first wave demonstrates the rules instead of leaking special balls immediately.
- Current playable slice: a campaign smoke simulator checks every wave against tower stats, enemy stats, route coverage, starter towers, wave bonuses, and a conservative auto-buy plan.
- Build pads show whether the selected tower can cover the path from that spot, and short-range towers are tuned so they have valid close-road pads.
- Build sockets now draw as grounded stone platforms under empty and occupied pads so towers visually sit on their spots.
- Build pad guidance is quieter during live waves and shows detailed PATH/FAR labels mainly while planning or hovering.
- Some waves now include mixed special balls such as Camo Regrow, Camo Lead, Camo Ceramic, Regrow Lead, and Regrow Ceramic.
- Current playable slice: the Start screen has a campaign level selector, and unlocked progress plus difficulty are saved locally.

Extra modes and rewards:

- Boss challenges
- Daily chests
- Powers that cost game money

## Intro Video

The intro should last about 1 minute.

Intro flow:

- The player first sees a choice to watch or skip the intro.
- If the player watches, balls roll around inside the house.
- The balls include normal, regrow, lead, ceramic, frozen, camouflage, and more.
- The balls leave the house and roll into the garden.
- They follow the garden trail toward the exit.
- After the intro finishes, a big Start button appears.
- If the player skips the intro, the Start button appears right away.
- The intro needs sound/music.
- Current playable slice: the stitched intro file has a video track and an AAC audio/music track.
- There are still more abilities to define.

## Audio

Current playable slice:

- Gameplay has a Sound On / Muted toggle in the HUD.
- Procedural sound effects play for waves, tower shots, pops, hero powers, overclocking, escapes, victory, and defeat.
- Sound preference is saved locally with campaign progress.
- Project checks now include a first-wave starter balance validator so each level starts with counters for its opening enemy mix.

## Player Side

The player is basically "all of the towers." Towers and heroes are on the good side.

Good-side things can include:

- Punch towers
- Bomb machines
- Dart machines
- Hot sauce machines
- Engineer towers
- Heroes
- Pets for towers and heroes

Adrian can stand near machines to activate them or control whether they are on or off.

## Permanent Tower And Hero Rule

Towers and heroes last forever after they are placed.

They only go away if the player sells them.

If an ability says it lasts for 2 rounds or 4 rounds, that timer is for the ability effect, not for the tower or hero.

Every ability needs a specific cooldown time.

## Pets Rule

Only towers and heroes can have pets.

Bad balls and enemies cannot have pets.

Current playable slice:

- Hero buttons show small friendly pet badges.
- Placeholder in-game tower pets are hidden until proper generated pet sprites exist.
- No enemy type has pet data or pet rendering.

No pets for:

- Pyramid / regrow balls
- Normal balls
- Lead balls
- Ceramic balls
- Camouflage balls
- Airships
- Any other enemy balls

## Heroes

### Liam

Liam is a basketball player hero.

Liam is Adrian's brother.

Appearance notes:

- Liam should have light skin.
- Liam should have black curly hair.
- Liam should wear a yellow basketball jersey with number 24.

Liam can:

- Blow balls backward
- Remove regrow from regrow balls
- Turn regrow balls into normal balls when his basketball power removes their regrow.

Liam's special ability:

- Normally lasts for 2 rounds
- With Knowledge, lasts for 4 rounds

Current playable slice:

- Liam's power creates a 2-second basketball aura that pushes balls backward and removes regrow.
- Buying Knowledge during a level costs game coins and makes Liam's basketball aura last 4 seconds.
- Liam's HUD icon and blowback animation use the generated curly black hair, yellow number 24 sprite art.
- Liam's blowback effect is scaled down and appears near the active ball group instead of covering the whole map.

Important: Liam himself stays forever unless sold. Only his special ability has a duration.

### Hacker Hossein

Hacker Hossein is a hero.

Appearance notes:

- Hacker Hossein is older.
- Hacker Hossein has less hair.
- Hacker Hossein's face and hair should resemble the provided reference photo.
- Keep Hacker Hossein's glasses and clothes the same in the game art.
- Hacker Hossein's HUD icon uses generated art with the older, lower-hair, glasses-and-hoodie look.

Known abilities:

- Level 3 ability: can deflate an additional ball layer for 4 seconds
- After those 4 seconds, it cannot pop balls for 2 seconds
- Level 10 ability: downgrades one most newly spawned ball
- Current playable slice: Hacker Hossein has a cooldown hero button that downgrades the newest active ball by one layer and plays a generated holographic hack effect over that ball.

## Towers

Each tower can have 3 upgrade paths.

Current playable slice:

- Remaining placeholder towers draw from the shared tower sprite atlas until each one gets a generated directional sheet.
- Dart Tower draws from a generated 4-frame directional twin-barrel sheet, with idle, left aim, right aim, and firing frames.
- Radar draws from a generated 4-frame animated support sheet, with idle, scan pulse, stronger pulse, and upgraded reveal frames.
- Engineer Adrian draws from a generated sprite sheet, with idle, aiming, and firing frames.
- Bomb Tower draws from a generated 4-frame directional cannon sheet, with direct left/right aim frames and a mirrored firing frame when needed.
- Hot Sauce Tower draws from a generated 4-frame directional sauce-machine sheet, with a visible spray frame for active attacks.
- Ice now draws from a compact generated v3 4-frame directional sprite sheet, cropped tightly so it lands on the build socket instead of floating or reading as oversized decoration.
- Missile Tower draws from a generated 4-frame directional sheet so it can face and fire toward targets instead of staying locked to one angle. Its left and right aim frames are used directly; only the firing frame mirrors when needed.
- Punch Tower draws from a generated 4-frame directional boxing-glove sheet, with a piston thrust frame for attacks.
- Towers use a tighter ground anchor so their bases sit closer to the build sockets.
- Build pads come from the generated map art. Runtime placement hints are soft glows and hover labels only, not heavy duplicate socket drawings.
- Tower art with enough frames can choose a facing/firing frame based on target direction; future tower sheets should include direction frames instead of relying on static front-facing art.
- Attack towers recoil/aim when firing so the tower layer feels animated, not static.
- Tower bodies and enemy bodies are depth-sorted together by ground position so balls can pass in front of or behind towers naturally.
- The selected tower panel shows simple capability chips for lead, camouflage, frozen, regrow, airship parts, and beacon support.
- The selected tower panel shows each upgrade path's effect, level pips, cost, maxed state, and missing-money state so it works on iPad without hover.
- The selected tower panel close button must consume the tap/click itself, and Escape closes the panel on PC.
- Upgraded towers show small colored pips on the tower base so upgrades are visible during combat.
- Attack towers can switch target priority between First, Last, Strong, and Near.
- The selected tower panel has a real close button; "Near" is targeting behavior, not panel closing.
- Combat shows floating text for damage, regrow, coin rewards, wave bonuses, and lives lost.
- Tower shop cards update their selected and affordable states as coins change.
- The iPad HUD is compacted so Liam, Hacker Hossein, Adrian Overclock, speed, pause, and wave controls can wrap cleanly.

### Punch Tower

Known idea:

- Punches balls

Possible paths:

- Strong punch
- Fast punch
- Knockback punch

### Bomb Machine

Known idea:

- Uses explosions
- Can pop lead balls

Possible paths:

- Bigger explosions
- Faster bombs
- Special bombs

### Dart Machine

Known idea:

- Shoots darts
- Sharp damage does not pop lead balls
- Darts may be useful against enemies that are immune to energy, fire, plasma, explosions, and ice
- Special blade attacks can shatter frozen balls

Possible paths:

- Faster darts
- Sharper darts
- Multi-darts

### Hot Sauce Machine

Known idea:

- Uses hot sauce as an attack
- Can pop any ball type except camouflage balls
- Needs camouflage detection support to pop camouflage balls

### Engineer Tower

Adrian is an Engineer Tower.

The Engineer Tower can support other towers and interact with special ball types.

Appearance notes:

- Adrian has black hair.

Known upgrades:

- Larger Service Area
- Removing Airship Parts
- Cleansing Foam
- Overclocking
- Sentry Turrets
- Oversized Nails
- More upgrades to define

Rules:

- Overclocking belongs to the Engineer Tower.
- Overclocking must target another tower.
- The targeted tower gets supercharged attack speed for a few seconds.
- Current playable slice: Adrian is now a real Engineer tower. Its Service Area upgrade path unlocks Sentry Turrets and then Overclocking.
- Current playable slice: Sentry Turrets draw two mini sentries beside Adrian and their extra shots fire from those sentries.
- Current playable slice: after Overclocking is unlocked, the Overclock button enters target mode, then tapping another attack tower supercharges its attack speed for 6 seconds and starts a cooldown.
- Current playable slice: the Cleansing Foam path removes regrow and camouflage from balls inside the Engineer radius, including mixed balls.
- Current playable slice: the Oversized Nails path can upgrade into Remove Airship Parts, which makes Engineer shots hurt airships much more.
- The Engineer Tower cannot pop lead balls by default.
- The Engineer Tower can help pop any type of ball if there is an upgraded beacon in range.

### Beacon

The beacon is an upgrade/support effect.

Known rules:

- If a beacon is upgraded, towers inside its radius can pop any type of ball.
- A radar scanner beacon upgrade lets all towers in its radius pop camouflage balls.
- To unlock radar scanners, the player first needs the Growing Very Block upgrade.
- Growing Very Block prevents regrow from working inside its radius.

Current playable slice:

- Radar and universal pop support now check whether the tower is inside the upgraded beacon's radius.
- Radar has a larger base support radius so it meaningfully covers nearby towers and camouflage balls.
- Growing Very Block still checks whether the regrow ball is inside the beacon's radius.

### Missile Tower

Missiles are special attacks.

Rules:

- Missiles look like rockets.
- Missiles always pop lead balls.
- Missiles sometimes pop frozen balls.
- This may be a tower, upgrade, or special attack.

## Enemy Ball Types

### Normal Balls

The basic enemy balls.

They are mostly more common than camouflage versions.

### Regrow Balls

Regrow balls are pyramid / triangle-shaped balls.

Rules:

- They can grow layers back after being popped.
- Liam can remove their regrow power.
- When Liam removes regrow, the regrow ball becomes a normal ball.
- Regrow balls restore lost layers every few seconds if their regrow power has not been removed.
- They do not have pets.
- Sometimes lead balls can be regrow.
- Sometimes ceramic balls can be regrow.
- Regrow does not create frozen balls.
- Current playable slice: Regrow Lead and Regrow Ceramic are real mixed enemies.
- Current playable slice: Liam and Cleansing Foam strip regrow off mixed enemies, turning Regrow Lead into Lead and Regrow Ceramic into Ceramic.

### Lead Balls

Lead balls are metal balls.

Rules:

- Immune to sharp damage
- Razors, sharp darts, and normal darts cannot pop them
- Bombs can pop them
- Fire can pop them
- Hot sauce can pop them unless they are camouflage lead balls without radar support
- Engineer Tower cannot pop them unless helped by an upgraded beacon

### Ceramic Balls

Ceramic balls are tougher balls.

Rules:

- They take 4 hits before popping.
- Airships can drop ceramic balls.
- When fortified, they take 8 hits before popping and spawning the next balls.

### Frozen Balls

Frozen balls are icy balls.

Rules:

- Immune to sharp damage, just like lead balls.
- Razors, sharp darts, and normal darts cannot pop them unless upgraded or supported.
- Missiles sometimes pop them.
- A special blade attack can shatter frozen balls.
- Balls become frozen when there is an Ice Tower.
- Frozen balls do not spawn naturally from regrow.

### Airship

The airship is a large enemy or boss enemy.

Rules:

- Appears after many balls are defeated
- Takes several hits
- Drops ceramic balls
- Can have parts removed by the Engineer Tower upgrade
- After a few rounds or waves, the airship tries to reach the exit.
- If the airship reaches the exit, the player loses all lives.
- Ceramics can count as equal to one low-tier airship for life loss.

Difficulty lives:

- Easy: 200 lives
- Medium: 150 lives
- Hard: 100 lives
- Expert: 50 lives
- Current playable slice: the Start screen has a difficulty selector with these four life totals.

## Fortified Enemies

Fortified is a stronger enemy class.

Known fortified enemies:

- Fortified lead
- Fortified ceramics
- Fortified airship class

Rules:

- Fortified ceramics take 8 hits.
- Normal ceramics take 4 hits.
- Fortified enemies are stronger versions of their normal enemy type.
- Current playable slice: fortified lead has 6 HP, fortified ceramic has 8 HP, and fortified airship is the final boss class.
- Current playable slice: fortified enemies draw a metal armor ring and an "F" badge over the normal sprite-sheet animation.

## Ice Tower

The Ice Tower can freeze balls.

Rules:

- Balls become frozen if there is an Ice Tower.
- There is an upgrade after Permanent Freeze called Snap.
- Snap can freeze lead balls and camouflage balls.
- Current playable slice: Ice Tower is a shop tower that freezes and slows normal balls, temporarily making them sharp-resistant.
- Current playable slice: Snap is the third upgrade on the Deep Freeze path and lets Ice Tower freeze lead and camouflage balls.

## Caramel Floss

Caramel Floss is a named idea that still needs a clear rule.

Possible notes:

- It may be a ball type, boss, ability, or modifier.
- It may interact with ceramics, camouflage, and other ball types.

## Immunity Ball Types

Some balls are built around immunities. These can be normal or camouflage versions.

### Explosion-Immune Ball

Rules:

- Immune to explosions
- Bomb Machine attacks do not work on it unless upgraded or supported

### Ice-Immune Ball

Rules:

- Immune to ice effects
- Ice attacks or slowing effects do not work on it

### Explosion-And-Ice-Immune Ball

Rules:

- Immune to explosions
- Immune to ice effects

### Super-Immune Ball

This is a weird special ball.

Rules:

- Immune to energy
- Immune to fire
- Immune to plasma
- Immune to explosions
- Immune to ice
- Try darts to pop them

## Camouflage

Camouflage is a special enemy property.

Rules:

- There can be camouflage versions of all ball types.
- There can be camouflage regrow balls.
- There can be camouflage lead balls.
- There can be camouflage ceramic balls.
- There can be camouflage versions of many other balls.
- There are also normal non-camouflage versions.
- Most balls are normal, then camouflage versions appear sometimes.

Possible meaning:

- Camouflage balls may be invisible or hard to see.
- Towers need camouflage detection to pop camouflage balls.
- A beacon with a radar scanner lets all towers in its radius pop camouflage balls.
- Current playable slice: Camo Regrow, Camo Lead, and Camo Ceramic are real mixed enemies.
- Current playable slice: Cleansing Foam strips camouflage from mixed enemies, turning Camo Lead into Lead and Camo Ceramic into Ceramic.
- Current playable slice: Camo Regrow loses both camouflage and regrow if it is inside Cleansing Foam range.

## Damage Types

Known damage types:

- Punch
- Sharp
- Blades
- Explosion
- Missiles
- Fire
- Hot sauce
- Ice
- Energy
- Plasma
- Blowback
- Foam
- Freeze
- Hacking / downgrading

## Damage And Immunity Rules

Confirmed rules:

- Lead balls are immune to sharp damage.
- Lead balls can be popped by bombs.
- Lead balls can be popped by fire.
- Missiles always pop lead balls.
- Missiles look like rockets.
- Frozen balls are immune to sharp damage.
- Missiles sometimes pop frozen balls.
- Special blades can shatter frozen balls.
- Ice Towers can turn balls into frozen balls.
- Snap can freeze lead balls and camouflage balls.
- Regrow can happen on lead and ceramic balls sometimes.
- Camo can happen on regrow, lead, and ceramic balls sometimes.
- Regrow does not spawn frozen balls.
- Hot sauce can pop any ball type except camouflage balls.
- Hot sauce can pop camouflage balls when helped by a beacon radar scanner.
- Growing Very Block prevents regrow from working in its radius.
- Radar scanners are unlocked after Growing Very Block.
- Explosion-immune balls ignore explosion damage.
- Ice-immune balls ignore ice effects.
- Super-immune balls ignore energy, fire, plasma, explosions, and ice.
- Darts may be the answer for super-immune balls.
- Upgraded beacon support can let towers in range pop any ball type.
- Beacon radar scanners let towers in range pop camouflage balls.

## Open Questions

These are good next questions for Adrian.

1. What tower can see camouflage balls without a beacon radar scanner?
2. What should the first boss airship look like?
3. Is Missile Tower its own tower, or an upgrade for another tower?
4. What is "me shooting blades" called in the game?
5. What exactly does Caramel Floss do?
6. What pets can towers and heroes have?
7. What does the intro look like scene by scene?
8. What are the cooldown times for each ability?
