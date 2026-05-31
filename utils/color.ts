export const PRESET_COLOR_NAMES = [
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose", "slate",
] as const

export function resolveColor(color: string): string {
  return color
}
