/**
 * Canonical chart palette + gradients. All three charts (StackedBar, PPP,
 * ProgressiveCurve) read from these constants so the reds, greens, blues, and
 * grays render identically across the page.
 */

export const CHART_COLORS = {
  stone: "#a8a29e", // stone-400 — default / unselected
  emerald: "#34d399", // emerald-400 — pinned city
  sky: "#38bdf8", // sky-400 — hovered city
  red: "#b91c1c", // red-700 — tax / state
} as const;

export const CHART_STROKE = {
  stone: "#78716c", // stone-500
  emerald: "#10b981", // emerald-500
  sky: "#0284c7", // sky-600
  red: "#7f1d1d", // red-900
} as const;

/**
 * Gradient opacity stops: top of fill → bottom of fill. Net uses 0.95 → 0.7
 * for an airy fade; tax uses 0.9 → 0.75 for a slightly denser block.
 */
export const NET_STOPS = { top: 0.95, bottom: 0.7 } as const;
export const TAX_STOPS = { top: 0.9, bottom: 0.75 } as const;
