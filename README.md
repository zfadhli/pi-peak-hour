# pi-peak-hour

A [pi](https://github.com/earendil-works/pi-coding-agent) extension that shows DeepSeek peak-hour pricing status in the footer, so you know when you're paying full price.

DeepSeek charges full price during **01:00–04:00 UTC** and **06:00–10:00 UTC**; every other hour is discounted. The footer shows a countdown to the next price switch:

```
[59m->peak]   # off-peak now, peak starts in 59 minutes (green)
[1h30m->off]  # peak now, off-peak starts in 1h30m (red)
```

## Features

- Live footer status, refreshed every 30s and on each turn
- Time to the next peak/off-peak transition, not just the current state
- `/peak` command with full detail: current UTC time, both windows, next switch
- No network calls, no config — pure UTC clock math

## Installation

Install as a pi package straight from GitHub:

```bash
pi install git:github.com/zfadhli/pi-peak-hour
```

Then run `/reload` inside pi. To uninstall:

```bash
pi remove git:github.com/zfadhli/pi-peak-hour
```

> [!TIP]
> To try it without installing, run `pi -e git:github.com/zfadhli/pi-peak-hour` — that loads the package for a single session only.

<details>
<summary>Local development install</summary>

Symlink the extension into pi's global extension directory:

```bash
ln -s "$PWD/extensions/deepseek-peak.ts" ~/.pi/agent/extensions/deepseek-peak.ts
```

Then `/reload` inside pi. Your working copy becomes the live extension, so edits show up on every reload.

</details>

## Usage

Once loaded, the status appears in the footer automatically.

| Command | Description |
|---------|-------------|
| `/peak` | Show current pricing tier, UTC time, peak windows, and next switch |

## How it works

The extension registers a status entry via `ctx.ui.setStatus()` and keeps it current from two triggers:

- `session_start` — initial render plus a 30-second interval timer
- `turn_start` — re-render on every user turn, so the countdown never looks stale

Peak membership is a half-open interval check (`start <= h < end`) against the two UTC windows. The next transition is the first window boundary later than the current time, wrapping to the next day's first boundary if the day is done. Colors come from the active theme (`error` while peak, `success` while off-peak).

## Project structure

```
extensions/deepseek-peak.ts   # peak math, status text, /peak command
package.json                  # pi package manifest (pi-package keyword)
```

## Development

Edit `extensions/deepseek-peak.ts`, then `/reload` in pi. If you installed via symlink, your working copy is the live extension.

> [!WARNING]
> pi extensions run with full system permissions. The status line is the only side effect of this one, but review anything you install.
