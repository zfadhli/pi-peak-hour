import type { ExtensionAPI, ExtensionContext, Theme } from '@earendil-works/pi-coding-agent'

// Peak windows in UTC hours [start, end). DeepSeek is full price inside, discounted outside.
const PEAK_WINDOWS = [
  [1, 4],
  [6, 10],
] as const satisfies readonly (readonly [number, number])[]

const BOUNDARIES: readonly number[] = [...new Set(PEAK_WINDOWS.flat())].sort((a, b) => a - b)
const FIRST_BOUNDARY = Math.min(...BOUNDARIES)

const ID = 'deepseek-peak'

function isPeak(d: Date): boolean {
  const h = d.getUTCHours() + d.getUTCMinutes() / 60
  return PEAK_WINDOWS.some(([s, e]) => h >= s && h < e)
}

/** UTC instant of the next peak/off-peak transition after `d`. */
function nextChange(d: Date): Date {
  const now = d.getUTCHours() + d.getUTCMinutes() / 60
  for (const h of BOUNDARIES) {
    if (h > now) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h))
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, FIRST_BOUNDARY))
}

function fmtDuration(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h${String(m % 60).padStart(2, '0')}m` : `${m}m`
}

function statusText(theme: Theme): string {
  const now = new Date()
  const at = nextChange(now)
  const color = isPeak(now) ? 'error' : 'success'
  return theme.fg(color, `[${fmtDuration(at.getTime() - now.getTime())}->${isPeak(at) ? 'peak' : 'off'}]`)
}

export default function (pi: ExtensionAPI) {
  let timer: ReturnType<typeof setInterval> | undefined

  const refresh = (ctx: ExtensionContext) => ctx.ui.setStatus(ID, statusText(ctx.ui.theme))

  pi.on('session_start', async (_event, ctx) => {
    refresh(ctx)
    clearInterval(timer)
    timer = setInterval(() => refresh(ctx), 30_000)
  })

  pi.on('turn_start', async (_event, ctx) => refresh(ctx))

  pi.on('session_shutdown', async () => {
    clearInterval(timer)
    timer = undefined
  })

  pi.registerCommand('peak', {
    description: 'Show DeepSeek peak-hour status',
    handler: async (_args, ctx) => {
      const now = new Date()
      const at = nextChange(now)
      const peak = isPeak(now)
      ctx.ui.notify(
        `DeepSeek ${peak ? 'PEAK (full price)' : 'off-peak (discount)'} — ${now.toISOString().slice(11, 16)} UTC\n` +
          `Peak windows: 01:00–04:00, 06:00–10:00 UTC\n` +
          `Next switch: ${at.toISOString().slice(11, 16)} UTC → ${isPeak(at) ? 'peak' : 'off-peak'} (in ${fmtDuration(at.getTime() - now.getTime())})`,
        peak ? 'warning' : 'info',
      )
    },
  })
}
