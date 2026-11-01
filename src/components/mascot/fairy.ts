export interface MascotData {
  body: string
  width: number
  height: number
}

const upperWing = 'M0 0 L11 -7 L25 0 L11 7 Z'
const lowerWing = 'M0 0 L7 -4.5 L16 0 L7 4.5 Z'

const sparkle = 'M0 -4 Q0.7 -0.7 4 0 Q0.7 0.7 0 4 Q-0.7 0.7 -4 0 Q-0.7 -0.7 0 -4 Z'

function wings(id: string, transform: string) {
  return `<g id="${id}" class="wing"${transform}>
    <path class="upper" d="${upperWing}" transform="translate(27 28) rotate(-142)"/>
    <path class="lower" d="${lowerWing}" transform="translate(27 36) rotate(148)"/>
  </g>`
}

const mirrored = ' transform="matrix(-1 0 0 1 64 0)"'

const lit = `<style>
  .halo-stop { stop-color: var(--lu-color-primary); }
  .core-heart { stop-color: var(--lu-color-glow); }
  .core-tint { stop-color: color-mix(in oklab, var(--lu-color-primary) 35%, var(--lu-color-glow)); }
  .core-edge { stop-color: var(--lu-color-primary); }
  .wing path {
    fill: color-mix(in oklab, var(--lu-color-primary) 28%, transparent);
    stroke: color-mix(in oklab, var(--lu-color-primary) 85%, var(--lu-color-glow));
    stroke-width: 2;
    stroke-linejoin: round;
  }
  #sparkles path { fill: var(--lu-color-accent); }
</style>
<defs>
  <radialGradient id="halo">
    <stop offset="0" class="halo-stop" stop-opacity="0.6"/>
    <stop offset="0.45" class="halo-stop" stop-opacity="0.2"/>
    <stop offset="1" class="halo-stop" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="core" cx="0.42" cy="0.4" r="0.62">
    <stop offset="0" class="core-heart"/>
    <stop offset="0.45" class="core-tint"/>
    <stop offset="1" class="core-edge"/>
  </radialGradient>
</defs>
<g id="glow"><circle cx="32" cy="32" r="30" fill="url(#halo)"/></g>
${wings('wing-left', '')}
${wings('wing-right', mirrored)}
<g id="body"><circle cx="32" cy="32" r="9" fill="url(#core)"/></g>
<g id="sparkles">
  <path d="${sparkle}" transform="translate(51 11)"/>
  <path d="${sparkle}" transform="translate(56 46) scale(0.7)"/>
  <path d="${sparkle}" transform="translate(9 53) scale(0.85)"/>
  <path d="${sparkle}" transform="translate(32 55) scale(0.6)"/>
</g>`

const dotted = `<style>
  .wing path, #body circle {
    fill: none;
    stroke: var(--lu-color-muted-foreground);
    stroke-width: 2.5;
    stroke-dasharray: 0 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
${wings('wing-left', '')}
${wings('wing-right', mirrored)}
<g id="body"><circle cx="32" cy="32" r="9"/></g>`

export const fairy: Record<'default' | 'empty', MascotData> = {
  default: { body: lit, width: 64, height: 64 },
  empty: { body: dotted, width: 64, height: 64 },
}
