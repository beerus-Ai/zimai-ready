import { Anim, INK, Svg, draw, star4 } from './shared';

type DecorProps = { className?: string; color?: string; animated?: boolean };

/** Hand-drawn underline squiggle for italic headline words. Stretches to its box. */
export function Squiggle({ className, color = '#ff6c4c', animated = true }: DecorProps) {
  return (
    <Svg className={className} viewBox="0 0 200 20" preserveAspectRatio="none">
      <path
        d="M4 12C18 5 29 4 41 10C53 17 64 17 76 11C88 4 100 4 112 10C124 17 135 17 147 11C159 5 173 5 196 8"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(animated, 0.2)}
      />
    </Svg>
  );
}

/** 4-point twinkle star. */
export function Sparkle({ className, color = '#ffa946', animated = true }: DecorProps) {
  return (
    <Svg className={className} viewBox="0 0 40 40">
      <Anim on={animated} cls="animate-ghost-pulse">
        <path d={star4(20, 20, 16)} fill={color} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <circle cx="34" cy="7" r="2" fill={color} stroke={INK} strokeWidth={1.4} />
      </Anim>
    </Svg>
  );
}
