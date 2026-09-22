# pi-peak-hour

Pi extension: shows DeepSeek peak-hour status in the footer.

DeepSeek charges full price 01:00–04:00 and 06:00–10:00 UTC; discounted outside.
Status renders `[59m->peak]` — time until the next price switch.

## Install

```bash
ln -s "$PWD/deepseek-peak.ts" ~/.pi/agent/extensions/deepseek-peak.ts
```

Then `/reload` in pi. `/peak` prints the current window and next switch.
