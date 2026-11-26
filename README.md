# DOOM.QR — Android Build

A tiny Doom-style raycaster that originally shipped inside a single URL hash, rebuilt as a simple Android WebView app with extra weapons, flying enemies, endless waves, music upload, save states and a hold-to-fast-forward button.

![DOOM.QR gameplay](screenshot.png)

## Install

1. Copy `DOOMQR.apk` to your Android phone (Android 5.0 / API 21 or newer).
2. Allow **Install unknown apps** for the file manager or browser you used.
3. Open the APK and install. The app is debug-signed, which is fine for personal use.

The game runs completely offline — no network permission is needed.

## How to play

Hold the phone in **landscape**.

### Touch controls

| Action | Control |
| --- | --- |
| Turn | Drag left or right on the **left half** of the screen |
| Move forward / back | Drag up or down on the **left half** |
| Fire | Tap and hold on the **right half** |
| Switch weapon | Tap **P / S / C / R** at the top, or keys `1`–`4` |
| Cycle weapon | `Q` key |
| 3× speed | **Hold** the bottom-right `3x` button; release to return to normal |
| Choose music | Tap **♫ MUSIC** (bottom-left), pick any audio file |
| Save progress | Tap **SAVE** (top-right) |
| Restore progress | Tap **LOAD** (top-right) |
| Restart after death/win | Tap the screen |

### Keyboard controls

| Key | Action |
| --- | --- |
| `W` / `↑`, `S` / `↓` | Move forward / back |
| `A` / `←`, `D` / `→` | Turn |
| `Space` | Fire |
| `1`–`4` | Pistol / Shotgun / Chaingun / Missile |
| `Q` | Cycle weapon |

## Weapons

| Button | Weapon | Handling |
| --- | --- | --- |
| **P** | Pistol | Fast, accurate, infinite ammo — your reliable fallback |
| **S** | Shotgun | 7 pellets, wide spread, slow cycle — good against ground crowds |
| **C** | Chaingun | Very fast, but spread grows the longer you hold it |
| **R** | Missile | Slow, costs 3 ammo, explodes with splash damage and gently homes on flying drones |

## Enemies and waves

- **Ground imps** chase you and throw fireballs. Tougher high-HP versions appear in later waves.
- **Flying drones** hover above the floor, close in and fire at you — the missile is the best air weapon.
- Each time you clear a wave, the next one brings more enemies.
- **The map grows with you**: every few waves a new sector and a connecting corridor are carved into previously unused space, exposing more routes so the game never feels boxed in. After all sectors are open, they keep expanding.
- Ammo crates and health kits spawn between waves.

## Score and combos

Every kill adds to your score. Kills in quick succession build a combo multiplier up to **×9**; it resets if you go too long without a kill. The end screen shows kills, score, wave and time.

## Music

The **MUSIC** button opens the Android file picker. The chosen song is copied into the app's private storage and loops continuously for the whole session — it keeps playing through death, restarts and wave changes. Picking another song replaces the current one.

## Save states

**SAVE** stores position, health, ammo, weapon, score, combo, wave and every enemy/thing in the Android app's private preferences. **LOAD** restores them, including re-opening all map sectors unlocked at that wave.

## Project layout

```
.
├── DOOMQR.apk            ready-to-install APK
├── screenshot.png        gameplay screenshot used above
└── DoomQR-Android/
    ├── AndroidManifest.xml
    ├── assets/
    │   ├── index.html    on-screen UI, 3x hold logic, music/bridge hooks
    │   └── game.js       game logic (weapons, enemies, waves, map growth, saves)
    ├── res/values/strings.xml
    ├── src/com/ashish/doomqr/MainActivity.java
    ├── AddDex.java       small helper used by the build script
    └── build.ps1         manual APK build script (needs Android SDK build-tools 34)
```

### Rebuilding

Install Android SDK platform 34 and build-tools 34.0.0, then run:

```powershell
.\DoomQR-Android\build.ps1
```

The freshly signed APK is written to `DoomQR-Android\DOOMQR.apk`.

## Credits

Original DOOM.QR game logic and art by Siddhant Dubey ([doomqr](https://github.com/siddhantdubey/doomqr), GPL-2.0). This build adds the Android wrapper and gameplay extensions.
