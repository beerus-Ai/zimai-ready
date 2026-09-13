import { Anim, C, INK, LINE, S, Svg, scallop, star4, type IllustrationProps } from './shared';

/** Ghost body outline (viewBox space 0 0 170 170). Exported so other art can reuse a mini ghost. */
export const GHOST_BODY =
  'M38 128C34 96 34 70 44 52C56 30 78 22 96 26C120 31 134 52 134 80C134 100 132 116 130 130C126 140 118 140 114 132C110 124 102 124 98 134C94 144 84 144 80 134C76 124 68 124 62 134C58 142 48 144 44 136C41 132 39 131 38 128Z';

export type GhostMood = 'happy' | 'thinking' | 'wave';

export function GhostMascot({ className, animated = true, mood = 'happy' }: IllustrationProps & { mood?: GhostMood }) {
  const on = animated;
  const thinking = mood === 'thinking';
  const ey = thinking ? -3 : 0;
  const label = thinking ? 'Friendly ghost mascot, thinking' : mood === 'wave' ? 'Friendly ghost mascot, waving hello' : 'Friendly ghost mascot';
  return (
    <Svg className={className} viewBox="0 0 170 170" label={label}>
      <ellipse cx="86" cy="161" rx="38" ry="5" fill={C.sand} />
      <Anim on={on} cls="animate-ghost-float">
        {/* whoosh lines */}
        <path d="M20 84Q14 95 20 106M29 92Q25 99 29 106" {...LINE} strokeWidth={2.2} />
        {/* soft offset shadow */}
        <path d={GHOST_BODY} fill={C.lav2} transform="translate(5 5)" />
        {mood === 'wave' && (
          <Anim on={on} cls="animate-wiggle" origin="left bottom" dur={1.6}>
            <path d="M126 98C140 96 151 84 151 71C151 62 142 60 139 67C137 76 134 82 124 86" fill={C.white} {...S} />
            <path d="M158 56Q165 62 163 71M150 50Q156 48 160 50" {...LINE} strokeWidth={2.2} />
          </Anim>
        )}
        <path d={GHOST_BODY} fill={C.white} {...S} />
        {/* highlight */}
        <path d="M50 78C48 63 55 49 67 41" stroke={C.lav} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M86 36Q92 34 98 35" stroke={C.lav} strokeWidth={4} strokeLinecap="round" fill="none" />
        {/* blush */}
        <ellipse cx="62" cy="95" rx="7" ry="4" fill={C.pink} />
        <ellipse cx="110" cy="95" rx="7" ry="4" fill={C.pink} />
        {/* eyes */}
        <Anim on={on} cls="animate-blink">
          <g transform={`translate(0 ${ey})`}>
            <ellipse cx="72" cy="78" rx="4.6" ry="7" fill={INK} />
            <ellipse cx="100" cy="78" rx="4.6" ry="7" fill={INK} />
            <circle cx="73.6" cy={thinking ? 74 : 75} r="1.6" fill={C.white} />
            <circle cx="101.6" cy={thinking ? 74 : 75} r="1.6" fill={C.white} />
          </g>
        </Anim>
        {/* mouth */}
        {mood === 'happy' && <path d="M79 92Q86 100 93 92" {...LINE} strokeWidth={2.6} />}
        {thinking && <path d="M81 96Q86 93 92 96" {...LINE} strokeWidth={2.6} />}
        {mood === 'wave' && <path d="M78 91Q86 105 94 91Z" fill={C.wine} {...S} strokeWidth={2.4} />}
        {/* spark(s) */}
        <Anim on={on} cls="animate-ghost-pulse">
          <path d={thinking ? star4(26, 36, 10) : star4(142, 30, 11)} fill={C.orange} {...S} strokeWidth={2.2} />
        </Anim>
        <Anim on={on} cls="animate-ghost-pulse" delay={1.1}>
          <path d={thinking ? star4(12, 56, 4.5) : mood === 'wave' ? star4(124, 14, 5) : star4(158, 50, 5)} fill={C.orange} {...S} strokeWidth={1.8} />
        </Anim>
        {thinking && (
          <g>
            <circle cx="117" cy="54" r="3" fill={C.white} {...S} strokeWidth={2} />
            <circle cx="125" cy="42" r="4.5" fill={C.white} {...S} strokeWidth={2.2} />
            <path d={scallop(141, 22, 25, 14, 6, 0.1, 5)} fill={C.white} {...S} strokeWidth={2.4} />
            {[130, 141, 152].map((cx, i) => (
              <Anim key={cx} on={on} cls="animate-ghost-pulse" delay={i * 0.35}>
                <circle cx={cx} cy="22" r="2.8" fill={C.teal} />
              </Anim>
            ))}
          </g>
        )}
      </Anim>
    </Svg>
  );
}
