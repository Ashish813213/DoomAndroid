# DOOM.QR — Android Edition

A tiny Doom-style raycaster that originally shipped inside a single URL hash, rebuilt as a straightforward Android WebView app and expanded into a full run-based shooter. Portrait-only, with a pixel-art monster launcher icon.

![DOOM.QR gameplay](screenshot.png)

## Install

1. Copy `DOOMQR.apk` to your Android phone (Android 5.0 / API 21+).
2. Allow **Install unknown apps** for the file manager or browser you used.
3. Open the APK and install. It is debug-signed, which is fine for personal use.

The game is fully offline and needs no internet permission.

## Screens

- **Title screen** — New Game, Continue, Daily Challenge, How To Play, plus best score/wave, achievement count and daily status.
- **Pause screen** (`II` button, `P` or `Esc`) — Resume, Save, Load, Restart, Title, music volume slider and touch-sensitivity slider.
- **Game over / escape screen** — shows kills, score, wave and time with replay options.

## How to play

The app runs in **portrait**. The 320×200 game view is scaled to the screen width and kept centred vertically; the controls still split the screen into left (move/turn) and right (fire) halves.

| Action | Control |
| --- | --- |
| Turn | Drag left/right on the **left half** of the screen |
| Move forward/back | Drag up/down on the **left half** |
| Fire | Tap and hold on the **right half** |
| Switch weapon | **P / S / C / R** buttons at the top, or keys `1`–`4` |
| Cycle weapon | `Q` key |
| Fast forward | **Hold** the bottom-right `3x` button; release to return to normal |
| Music | `♫ MUSIC` button (bottom-left) |
| Save / Load | `SAVE` / `LOAD` buttons (top-right) |
| Pause | `II` button or `P` / `Esc` |
| Restart after death/win | Tap the screen |

Keyboard: `W`/`↑` and `S`/`↓` move, `A`/`←` and `D`/`→` turn, `Space` fires.

## Weapons

| Button | Weapon | Handling |
| --- | --- | --- |
| **P** | Pistol | Fast, accurate, unlimited ammo — reliable fallback |
| **S** | Shotgun | 7 pellets, wide spread, slow cycle — great vs ground crowds |
| **C** | Chaingun | Very fast, but spread grows the longer you hold it |
| **R** | Missile | Slow, costs 3 ammo, explodes with splash and gently homes on flyers |

Cyan **upgrade pickups** permanently level up the weapon you are holding (max level 5): more damage, faster cycle, extra shotgun pellets and larger missile splash.

## Enemies

- **Imp** — the original ground chaser, throws fireballs.
- **Flyer** — hovering drone, closes in and fires; missile is the best answer.
- **Swarmer** — small, very fast, attacks in numbers.
- **Brute** — heavily armoured; resists shotgun but takes double damage from missiles.
- **Sniper** — slow, long-range accurate fireballs.
- **Boss** — spawns every 5th wave, 600 HP, red health bar at the top; missiles and chaingun deal 1.5× damage.

## Waves and the growing map

Clear a wave and the next one brings more and tougher enemies. Crucially, **the map grows with you**: each wave carves a new sector into previously unused space and links it to the existing maze with a corridor; after all sectors are open they keep expanding. This keeps new routes appearing so later waves never feel boxed in.

A small **minimap** in the top-left shows open cells, the exit, the player and enemies.

## Score, combos and progression

- Kills build a combo multiplier up to **×9**; it resets if you go too long without a kill.
- Damage numbers and a hit marker give immediate feedback, with sound effects and vibration.
- **High scores** (top 5), best score and best wave are saved locally.
- **Achievements** such as x5 combo and reaching wave 5.
- **Daily Challenge** — a fixed-seed run, once per day.
- **Unlockables** — reach wave 5 to start with extra ammo, wave 10 to start with an upgraded missile.

## Music

`♫ MUSIC` opens the Android file picker. The song is **streamed** directly from the picked file (no slow copy) and loops continuously through the whole session, including death and restarts. The pause screen has a **volume slider**; audio focus is handled so music pauses for calls and resumes afterwards. The status line shows the current track name.

## Save states

`SAVE` stores position, health, ammo, weapon, upgrade levels, score, combo, wave, daily state and every enemy/thing in Android private preferences. `LOAD` restores all of it and reopens every map sector unlocked at that wave. High scores and achievements are stored separately so they survive a restart.

## Performance and UX

The 3x button runs game logic three times per frame while skipping redundant canvas uploads, so fast-forward stays smooth on low-end phones. Touch sensitivity is adjustable. Sound effects use the Web Audio API; haptics use the Android vibrator.

## Project layout

```
.
├── DOOMQR.apk            ready-to-install APK
├── screenshot.png        gameplay screenshot used above
└── DoomQR-Android/
    ├── AndroidManifest.xml
    ├── assets/
    │   ├── index.html    UI, overlays, 3x logic, music controls
    │   └── game.js       game logic (weapons, enemies, waves, map, saves)
    ├── res/values/strings.xml
    ├── src/com/ashish/doomqr/MainActivity.java
    ├── AddDex.java       helper used by the build script
    └── build.ps1         manual APK build script
```

### Rebuilding

Install Android SDK platform 34 and build-tools 34.0.0, then run:

```powershell
.\DoomQR-Android\build.ps1
```

The signed APK is written to `DoomQR-Android\DOOMQR.apk`.

## Credits

Original DOOM.QR game logic and art by Siddhant Dubey ([doomqr](https://github.com/siddhantdubey/doomqr), GPL-2.0). This build adds the Android wrapper and all gameplay extensions.
