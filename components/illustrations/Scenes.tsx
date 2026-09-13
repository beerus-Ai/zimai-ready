import { useId } from 'react';
import { GHOST_BODY } from './GhostMascot';
import { Anim, C, DrawReveal, Head, INK, LINE, S, Svg, Tube, Twinkle, bubble, draw, pd, scallop, star4, svgId, wobCircle, wrect, type IllustrationProps } from './shared';

/* ------------------------------------------------------------------ */
/* MagnifierSprout — assess / discover                                 */
/* ------------------------------------------------------------------ */

const SPEECH = 'M62 108C90 98 170 96 206 106C222 112 224 180 208 192C180 202 120 204 98 200L60 224L72 196C50 190 42 180 44 150C45 124 48 112 62 108Z';

export function MagnifierSprout({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Hand holding a magnifying glass over a speech bubble with a growing sprout">
      <path d="M232 36Q272 26 296 58" {...LINE} stroke={C.coral} strokeWidth={3} strokeDasharray="1 9" />
      <path d={SPEECH} fill={C.sand} transform="translate(8 8)" />
      <path d={SPEECH} fill={C.lav} {...S} />
      <path d="M70 150H150M70 166H176M70 182H120" {...LINE} strokeWidth={2.6} />
      <circle cx="162" cy="182" r="3" fill={INK} />

      {/* sprout */}
      <Anim on={on} cls="animate-wiggle" origin="center bottom" dur={3.6}>
        <path d="M130 102C128 88 132 76 127 60" {...LINE} stroke={C.teal} strokeWidth={4} />
        <path d="M129 84C118 84 104 78 99 66C112 62 126 70 129 84Z" fill={C.teal2} {...S} strokeWidth={2.4} />
        <path d="M128 72C134 58 148 50 162 52C160 66 144 74 128 72Z" fill={C.teal2} {...S} strokeWidth={2.4} />
        <path d="M110 70Q120 74 127 82M136 64Q146 58 156 56" {...LINE} strokeWidth={1.6} />
      </Anim>
      <path d="M116 104Q123 97 130 101Q137 97 144 104" {...LINE} strokeWidth={2.2} />

      {/* hand + magnifier */}
      <Anim on={on} cls="animate-float" dur={5}>
        <path d="M302 262C284 214 256 190 234 172L212 192C236 210 254 232 266 262Z" fill={C.teal} {...S} />
        <path d="M232 174L213 191" stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
        <path d={wobCircle(136, 72, 31.5, 4, 0.02)} fill={C.white} fillOpacity={0.35} stroke={C.orange} strokeWidth={9} />
        <path d={wobCircle(136, 72, 36, 4, 0.02)} {...LINE} strokeWidth={3} />
        <path d={wobCircle(136, 72, 27, 4, 0.02)} {...LINE} strokeWidth={2.4} />
        <path d="M117 64C118 55 124 49 132 47" stroke={C.white} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M166 100L204 138" stroke={INK} strokeWidth={17} strokeLinecap="round" />
        <path d="M166 100L204 138" stroke={C.coral} strokeWidth={11} strokeLinecap="round" />
        <path d="M196 132C206 122 226 128 234 140C240 150 236 170 224 176C212 182 196 176 190 164C186 154 188 140 196 132Z" fill={C.skin3} {...S} />
        <path d="M200 147Q210 142 219 150M198 159Q208 154 217 162" {...LINE} strokeWidth={2} />
        <path d="M206 129C200 119 186 120 186 128C186 134 196 137 205 139" fill={C.skin3} {...S} />
      </Anim>

      <path d="M90 36L98 45M80 52L91 54" {...LINE} strokeWidth={2.4} />
      <Twinkle x={56} y={62} s={12} on={on} />
      <Twinkle x={252} y={86} s={8} fill={C.pink} on={on} delay={0.9} />
      <Twinkle x={278} y={124} s={5} fill={C.coral} on={on} delay={1.7} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* CertificateRibbon                                                   */
/* ------------------------------------------------------------------ */

type Confetti = [x: number, y: number, kind: 'rect' | 'dot' | 'squig' | 'tri' | 'star', color: string, rot: number];
const CONFETTI: Confetti[] = [
  [26, 24, 'rect', C.pink, 20],
  [96, 18, 'squig', C.teal2, 0],
  [152, 20, 'dot', C.orange, 0],
  [206, 14, 'tri', C.coral, 15],
  [292, 24, 'rect', C.lav2, -30],
  [18, 112, 'dot', C.teal2, 0],
  [302, 98, 'squig', C.coral, 60],
  [22, 204, 'tri', C.orange, -10],
  [298, 196, 'rect', C.pink, 40],
  [120, 218, 'squig', C.orange, 0],
  [172, 222, 'dot', C.lav2, 0],
  [296, 146, 'star', C.orange, 0],
];

function ConfettiPiece({ c: [x, y, kind, color, rot], on, i }: { c: Confetti; on: boolean; i: number }) {
  let el;
  if (kind === 'rect') el = <path d={wrect(-6, -3, 12, 6, 1.5, 0.4)} fill={color} {...S} strokeWidth={2} />;
  else if (kind === 'dot') el = <circle r="4.2" fill={color} {...S} strokeWidth={2} />;
  else if (kind === 'squig') el = <path d="M-9 0Q-4.5 -6 0 0Q4.5 6 9 0" {...LINE} stroke={color} strokeWidth={3.2} />;
  else if (kind === 'tri') el = <path d="M0 -6L6 5L-6 5Z" fill={color} {...S} strokeWidth={2} />;
  else el = <path d={star4(0, 0, 8)} fill={color} {...S} strokeWidth={2} />;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Anim on={on} cls={kind === 'star' ? 'animate-ghost-pulse' : 'animate-float'} delay={i * 0.35} dur={kind === 'star' ? undefined : 4}>
        {el}
      </Anim>
    </g>
  );
}

export function CertificateRibbon({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Certificate scroll with a rosette ribbon and confetti">
      {CONFETTI.map((c, i) => (
        <ConfettiPiece key={i} c={c} on={on} i={i} />
      ))}
      <path d={wrect(56, 52, 196, 124, 4)} fill={C.lav2} transform="translate(9 9)" />
      <path d={wrect(56, 52, 196, 124, 4)} fill={C.cream} {...S} />
      {/* rolls */}
      <path d={wrect(44, 40, 220, 18, 9, 1)} fill={C.sand} {...S} />
      <path d={wrect(44, 170, 220, 18, 9, 1)} fill={C.sand} {...S} />
      {[[44, 49], [264, 49], [44, 179], [264, 179]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <path d={wobCircle(cx, cy, 9, 2, 0.02)} fill={C.cream} {...S} strokeWidth={2.4} />
          <path d={pd`M${cx - 3} ${cy}A3 3 0 1 0 ${cx} ${cy - 3}`} {...LINE} strokeWidth={1.8} />
        </g>
      ))}
      {/* content */}
      <path d="M104 84H204" stroke={C.teal} strokeWidth={6} strokeLinecap="round" />
      <path d="M126 99H182" stroke={C.teal2} strokeWidth={3} strokeLinecap="round" />
      <path d="M84 120H224M84 134H192" {...LINE} strokeWidth={2.4} />
      <path d="M86 156C94 146 100 160 108 150C114 144 118 158 126 152C134 146 140 156 152 151" {...LINE} stroke={C.coral} strokeWidth={2.8} {...draw(on, 0.5)} />
      <path d="M84 162H160" {...LINE} strokeWidth={1.6} />
      <Twinkle x={86} y={84} s={7} on={on} delay={0.4} />

      {/* rosette */}
      <Anim on={on} cls="animate-wiggle" origin="center top" dur={3.2}>
        <path d="M212 164L198 216L211 208L219 221L227 170Z" fill={C.coral} {...S} />
        <path d="M232 170L238 221L247 210L259 217L243 162Z" fill={C.wine} {...S} />
        <path d={scallop(224, 152, 28, 28, 12, 0.1, 9)} fill={C.orange} {...S} />
        <path d={wobCircle(224, 152, 18, 5)} fill={C.coral} {...S} strokeWidth={2.4} />
        <path d="M215 152L221 158L233 145" {...LINE} stroke={C.cream} strokeWidth={3.6} />
      </Anim>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* GrowthPath                                                          */
/* ------------------------------------------------------------------ */

const TRAIL = 'M40 232C100 228 172 214 150 196C130 180 90 186 110 168C130 150 190 156 196 130C200 110 172 110 190 96C206 84 236 84 260 62';

function Flag({ x, y, color, on, delay, big = false }: { x: number; y: number; color: string; on: boolean; delay: number; big?: boolean }) {
  const k = big ? 1.3 : 1;
  const h = 34 * k;
  return (
    <g>
      <path d={pd`M${x} ${y}L${x} ${y - h}`} {...LINE} strokeWidth={2.6} />
      <Anim on={on} cls="animate-wiggle" origin="left center" delay={delay} dur={2.2}>
        <path d={pd`M${x + 1} ${y - h}C${x + 10 * k} ${y - h - 4 * k} ${x + 18 * k} ${y - h + 4 * k} ${x + 27 * k} ${y - h + 1 * k}C${x + 22 * k} ${y - h + 7 * k} ${x + 22 * k} ${y - h + 11 * k} ${x + 27 * k} ${y - h + 16 * k}C${x + 18 * k} ${y - h + 19 * k} ${x + 10 * k} ${y - h + 10 * k} ${x + 1} ${y - h + 14 * k}Z`} fill={color} {...S} strokeWidth={2.4} />
        {big && <path d={star4(x + 11 * k, y - h + 7 * k, 5)} fill={C.cream} {...S} strokeWidth={1.6} />}
      </Anim>
      <ellipse cx={x} cy={y} rx={5} ry={2.2} fill={INK} />
    </g>
  );
}

export function GrowthPath({ className, animated = true }: IllustrationProps) {
  const on = animated;
  const maskId = `gp-${svgId(useId())}`;
  return (
    <Svg className={className} label="Winding dotted path up a hill with milestone flags and a walker">
      <Anim on={on} cls="animate-float" dur={7}>
        <path d={scallop(58, 56, 26, 11, 5, 0.16, 3)} fill={C.white} {...S} strokeWidth={2.4} />
      </Anim>
      <Anim on={on} cls="animate-float" dur={8} delay={1.5}>
        <path d={scallop(158, 36, 20, 9, 4, 0.16, 6)} fill={C.white} {...S} strokeWidth={2.4} />
      </Anim>
      <path d="M100 82Q105 77 110 82Q115 77 120 82" {...LINE} strokeWidth={2} />

      <path d="M-10 250L-10 170C40 130 100 110 150 128C190 142 230 110 330 100L330 250Z" fill={C.sand} {...S} />
      <path d="M-10 250L-10 222C30 206 80 180 120 150C160 120 200 76 250 56C278 46 300 48 330 62L330 250Z" fill={C.teal2} {...S} />
      <path d="M28 236l3 -6l3 6l3 -5M226 128l3 -6l3 6M284 96l3 -6l3 6l3 -5M88 212l3 -6l3 6" {...LINE} strokeWidth={2} />

      <DrawReveal id={maskId} d={TRAIL} on={on} width={16} delay={0.2}>
        <path d={TRAIL} fill="none" stroke={C.cream} strokeWidth={4.5} strokeLinecap="round" strokeDasharray="0.5 11" />
      </DrawReveal>

      <Flag x={110} y={168} color={C.orange} on={on} delay={0} />
      <Flag x={196} y={130} color={C.pink} on={on} delay={0.5} />
      <Flag x={260} y={62} color={C.coral} on={on} delay={1} big />

      {/* walker */}
      <Anim on={on} cls="animate-float" dur={1.6}>
        <Tube d="M54 220L49 231" color={C.teal} w={4.5} sw={2.2} />
        <Tube d="M62 220L67 230" color={C.teal} w={4.5} sw={2.2} />
        <path d={wrect(41, 199, 11, 17, 4, 0.5)} fill={C.coral} {...S} strokeWidth={2.2} />
        <path d={wrect(48, 197, 20, 26, 8, 0.8)} fill={C.orange} {...S} strokeWidth={2.4} />
        <Tube d="M62 206L70 214" color={C.orange} w={4.5} sw={2.2} />
        <path d={wobCircle(59, 188, 8, 2)} fill={C.skin1} {...S} strokeWidth={2.4} />
        <path d="M51 186C51 177 67 177 67 185C62 182 56 182 51 186Z" fill={INK} />
        <circle cx="62.5" cy="189" r="1.4" fill={INK} />
      </Anim>

      <Twinkle x={212} y={24} s={10} on={on} />
      <Twinkle x={118} y={22} s={6} fill={C.pink} on={on} delay={1} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* ShieldHands — responsible AI / privacy                              */
/* ------------------------------------------------------------------ */

const SHIELD = 'M160 36C184 50 206 54 228 52C232 110 214 160 160 190C106 160 88 110 92 52C114 54 136 50 160 36Z';

function Palm({ skin, sleeve }: { skin: string; sleeve: string }) {
  return (
    <g>
      <Tube d="M80 206L44 262" color={sleeve} w={26} />
      <path d="M70 150C84 136 104 140 112 156C120 172 120 196 106 208C92 218 70 214 62 198C56 184 58 162 70 150Z" fill={skin} {...S} />
      <path d="M64 174Q76 170 86 176M63 188Q75 184 85 190" {...LINE} strokeWidth={2} />
    </g>
  );
}

function Thumb({ skin }: { skin: string }) {
  return <path d="M100 152C103 138 119 132 124 141C128 149 120 158 110 164C104 166 99 160 100 152Z" fill={skin} {...S} />;
}

export function ShieldHands({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Two hands holding a shield with a check mark">
      <Anim on={on} cls="animate-spin-slow" dur={40}>
        <circle cx="160" cy="112" r="92" stroke={C.teal2} strokeWidth={2} strokeDasharray="4 9" strokeLinecap="round" />
      </Anim>
      <Twinkle x={52} y={46} s={12} on={on} />
      <Twinkle x={272} y={42} s={9} fill={C.pink} on={on} delay={0.8} />
      <Twinkle x={286} y={150} s={6} fill={C.coral} on={on} delay={1.5} />
      <Twinkle x={34} y={130} s={6} fill={C.lav2} on={on} delay={2.1} />

      <Anim on={on} cls="animate-float" dur={6}>
        <Palm skin={C.skin1} sleeve={C.orange} />
        <g transform="translate(320 0) scale(-1 1)">
          <Palm skin={C.skin3} sleeve={C.lav2} />
        </g>
        <path d={SHIELD} fill={C.lav2} transform="translate(8 8)" />
        <path d={SHIELD} fill={C.teal} {...S} />
        <path d="M160 52C178 62 196 66 212 66C212 110 198 146 160 172C122 146 108 110 108 66C124 66 142 62 160 52Z" fill={C.teal2} {...S} strokeWidth={2.4} />
        <path d="M118 76C117 100 122 122 132 138" stroke={C.cream} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M130 112L152 134L192 90" fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" {...draw(on, 0.4)} />
        <path d="M130 112L152 134L192 90" fill="none" stroke={C.cream} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" {...draw(on, 0.4)} />
        <Thumb skin={C.skin1} />
        <g transform="translate(320 0) scale(-1 1)">
          <Thumb skin={C.skin3} />
        </g>
      </Anim>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* ChatBubbles — tutor                                                 */
/* ------------------------------------------------------------------ */

export function ChatBubbles({ className, animated = true }: IllustrationProps) {
  const on = animated;
  const b1 = bubble(28, 24, 170, 56, 16, 18, 16, -10, 16);
  const b2 = bubble(118, 98, 176, 52, 16, 142, 16, 18, 16);
  const b3 = bubble(36, 166, 112, 48, 16, 16, 14, -10, 14);
  return (
    <Svg className={className} label="Stack of chat bubbles with an AI tutor typing">
      <Anim on={on} cls="animate-float" dur={6}>
        <path d={b1} fill={C.lav2} transform="translate(6 6)" />
        <path d={b1} fill={C.white} {...S} />
        <g transform="translate(37 28) scale(0.29)">
          <path d={GHOST_BODY} fill={C.lav} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <ellipse cx="72" cy="80" rx="6" ry="9" fill={INK} />
          <ellipse cx="100" cy="80" rx="6" ry="9" fill={INK} />
        </g>
        <path d="M90 44H176M90 58H148" {...LINE} strokeWidth={2.6} />
        <path d={star4(166, 58, 6)} fill={C.orange} {...S} strokeWidth={1.8} />
      </Anim>

      <Anim on={on} cls="animate-float" dur={6} delay={0.8}>
        <path d={b2} fill={C.sand} transform="translate(6 6)" />
        <path d={b2} fill={C.pink} {...S} />
        <path d="M138 118H272M138 132H232" {...LINE} strokeWidth={2.6} />
        <path d="M252 131L257 136L266 126" {...LINE} stroke={C.teal} strokeWidth={2.8} />
      </Anim>

      <Anim on={on} cls="animate-float" dur={6} delay={1.6}>
        <path d={b3} fill={C.lav2} transform="translate(6 6)" />
        <path d={b3} fill={C.lav} {...S} />
        {[66, 92, 118].map((cx, i) => (
          <Anim key={cx} on={on} cls="animate-float" dur={1.2} delay={i * 0.18}>
            <circle cx={cx} cy={192} r={6} fill={C.teal} />
          </Anim>
        ))}
      </Anim>

      {/* learner avatar */}
      <path d={wobCircle(278, 198, 24, 3)} fill={C.orange} {...S} />
      <Head x={278} y={201} r={15} skin={C.skin2} hair="crop" on={on} seed={3} />

      <Twinkle x={232} y={40} s={11} on={on} />
      <Twinkle x={300} y={66} s={6} fill={C.coral} on={on} delay={0.9} />
      <Twinkle x={192} y={196} s={7} fill={C.pink} on={on} delay={1.6} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* RocketChart — employer analytics / growth                           */
/* ------------------------------------------------------------------ */

const TREND = 'M76 152L124 126L172 98L220 68L238 56';

export function RocketChart({ className, animated = true }: IllustrationProps) {
  const on = animated;
  const maskId = `rc-${svgId(useId())}`;
  const bars: [number, number, string][] = [
    [60, 166, C.lav2],
    [108, 140, C.pink],
    [156, 112, C.orange],
    [204, 82, C.teal2],
  ];
  return (
    <Svg className={className} label="Bar chart with a rocket taking off from the trend line">
      <path d="M46 170H290M46 130H290M46 90H200" stroke={C.sand} strokeWidth={2} strokeDasharray="5 7" strokeLinecap="round" />
      {bars.map(([x, top, fill]) => (
        <g key={x}>
          <path d={wrect(x, top, 32, 208 - top, 6, 1)} fill={C.sand} transform="translate(6 0)" />
          <path d={wrect(x, top, 32, 212 - top, 6, 1)} fill={fill} {...S} />
          <path d={pd`M${x + 8} ${top + 10}V${top + 22}`} stroke={C.cream} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
      <path d="M40 26L40 208L292 208M34 34L40 26L46 34M284 202L292 208L284 214" {...LINE} />

      <DrawReveal id={maskId} d={TREND} on={on} width={14} delay={0.2}>
        <path d={TREND} {...LINE} stroke={C.coral} strokeWidth={3.2} strokeDasharray="7 7" />
      </DrawReveal>
      {[[76, 152], [124, 126], [172, 98], [220, 68]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={4.5} fill={C.cream} {...S} strokeWidth={2.2} />
      ))}

      {/* smoke */}
      {[[206, 74, 7], [192, 84, 5], [182, 90, 3.5]].map(([cx, cy, r], i) => (
        <Anim key={cx} on={on} cls="animate-ghost-pulse" delay={i * 0.4} dur={2}>
          <path d={wobCircle(cx, cy, r, i + 1)} fill={C.white} {...S} strokeWidth={2.2} />
        </Anim>
      ))}

      {/* rocket */}
      <g transform="translate(262 40) rotate(58)">
        <Anim on={on} cls="animate-float" dur={2.6}>
          <Anim on={on} cls="animate-wiggle" origin="center top" dur={0.5}>
            <path d="M-7 27C-9 39 -3 44 0 54C3 44 9 39 7 27Z" fill={C.orange} {...S} strokeWidth={2.4} />
            <path d="M-3 28C-4 35 -1 38 0 43C1 38 4 35 3 28Z" fill={C.coral} />
          </Anim>
          <path d="M-12 6L-25 22L-12 20Z" fill={C.coral} {...S} strokeWidth={2.4} />
          <path d="M12 6L25 22L12 20Z" fill={C.coral} {...S} strokeWidth={2.4} />
          <path d="M-8 20L8 20L6 27L-6 27Z" fill={C.sand} {...S} strokeWidth={2.4} />
          <path d="M0 -36C14 -24 16 0 12 20L-12 20C-16 0 -14 -24 0 -36Z" fill={C.white} {...S} />
          <path d="M-7 -24C-2 -27 2 -27 7 -24" {...LINE} stroke={C.coral} strokeWidth={3} />
          <path d={wobCircle(0, -6, 6.5, 4, 0.02)} fill={C.lav2} {...S} strokeWidth={2.4} />
        </Anim>
      </g>

      <Twinkle x={64} y={44} s={11} on={on} />
      <Twinkle x={136} y={56} s={7} fill={C.pink} on={on} delay={0.8} />
      <Twinkle x={298} y={110} s={6} fill={C.coral} on={on} delay={1.5} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* BrainSpark — AI skills                                              */
/* ------------------------------------------------------------------ */

const BRAIN = 'M118 118C100 112 98 88 112 80C108 62 124 48 140 54C146 40 170 38 178 50C194 42 214 54 210 72C226 78 226 104 210 112C212 126 200 136 188 134L132 134C120 136 110 128 118 118Z';

export function BrainSpark({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Lightbulb with a friendly brain and orbiting sparks">
      <Anim on={on} cls="animate-spin-slow" dur={18}>
        <circle cx="162" cy="104" r="96" stroke={C.teal2} strokeWidth={2.2} strokeDasharray="3 10" strokeLinecap="round" />
        <path d={star4(258, 104, 11)} fill={C.orange} {...S} strokeWidth={2.2} />
        <path d={star4(94, 36, 8)} fill={C.pink} {...S} strokeWidth={2} />
        <path d={wobCircle(100, 178, 6, 3)} fill={C.coral} {...S} strokeWidth={2.2} />
      </Anim>

      <Anim on={on} cls="animate-ghost-pulse" dur={2.2}>
        <path d="M160 28V16M206 36L214 28M114 36L106 28" {...LINE} stroke={C.orange} strokeWidth={3} />
      </Anim>

      <Anim on={on} cls="animate-float" dur={5}>
        {/* circuits */}
        <path d="M104 96H80L72 88M104 118H86M218 96H242L250 104" {...LINE} strokeWidth={2.4} />
        <circle cx="69" cy="85" r="3.8" fill={C.cream} {...S} strokeWidth={2} />
        <circle cx="82" cy="118" r="3.8" fill={C.cream} {...S} strokeWidth={2} />
        <circle cx="253" cy="107" r="3.8" fill={C.cream} {...S} strokeWidth={2} />

        <path d={BRAIN} fill={C.lav2} transform="translate(7 7)" />
        <path d="M136 132C138 146 142 152 144 160L176 160C178 152 182 146 184 132Z" fill={C.lav} {...S} />
        <path d="M150 140V150" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        <path d={BRAIN} fill={C.pink} {...S} />
        <path d="M128 80C136 76 142 84 138 92M188 68C180 70 178 80 186 84M124 104C132 100 140 108 136 116M198 98C190 100 188 110 196 114M150 58Q160 52 170 58" {...LINE} strokeWidth={2.2} />
        <ellipse cx="143" cy="118" rx="6" ry="3.5" fill={C.coral} opacity={0.45} />
        <ellipse cx="177" cy="118" rx="6" ry="3.5" fill={C.coral} opacity={0.45} />
        <Anim on={on} cls="animate-blink" delay={0.6}>
          <circle cx="148" cy="102" r="3.2" fill={INK} />
          <circle cx="172" cy="102" r="3.2" fill={INK} />
        </Anim>
        <path d="M152 112Q160 120 168 112" {...LINE} strokeWidth={2.4} />

        <path d={wrect(142, 160, 36, 26, 5, 0.8)} fill={C.sand} {...S} />
        <path d="M142 169H178M142 178H178" {...LINE} strokeWidth={2} />
        <path d="M150 186Q160 198 170 186Z" fill={INK} {...S} strokeWidth={2} />
      </Anim>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* MapPins — learning path                                             */
/* ------------------------------------------------------------------ */

const ROUTE = 'M66 186C92 166 96 138 132 142C168 146 166 104 196 100C222 96 232 84 248 80';
const MAP = 'M40 60L120 44L200 64L280 48L280 200L200 216L120 196L40 212Z';
const PIN = 'M0 0C-4 -10 -14 -16 -14 -28C-14 -38 -8 -44 0 -44C8 -44 14 -38 14 -28C14 -16 4 -10 0 0Z';

export function MapPins({ className, animated = true }: IllustrationProps) {
  const on = animated;
  const uid = svgId(useId());
  const clipId = `mp-c-${uid}`;
  const maskId = `mp-m-${uid}`;
  return (
    <Svg className={className} label="Folded map with pins and a dashed learning route">
      <defs>
        <clipPath id={clipId}>
          <path d={MAP} />
        </clipPath>
      </defs>
      <path d={MAP} fill={C.sand} transform="translate(8 8)" />
      <path d="M40 60L120 44L120 196L40 212Z" fill={C.lav} />
      <path d="M120 44L200 64L200 216L120 196Z" fill={C.lav2} />
      <path d="M200 64L280 48L280 200L200 216Z" fill={C.lav} />

      <g clipPath={`url(#${clipId})`}>
        <path d="M30 122C70 110 90 140 120 128C150 116 170 150 200 140C230 130 250 110 290 118" stroke={C.teal2} strokeWidth={8} fill="none" />
        <path d="M30 122C70 110 90 140 120 128C150 116 170 150 200 140C230 130 250 110 290 118" stroke={C.cream} strokeWidth={1.6} strokeDasharray="4 6" fill="none" />
        <path d={scallop(78, 84, 16, 12, 5, 0.12, 2)} fill={C.pink} {...S} strokeWidth={2} />
        <path d={scallop(236, 176, 18, 12, 5, 0.12, 5)} fill={C.pink} {...S} strokeWidth={2} />
        <path d="M60 60L72 212M160 40L166 220M20 170L300 168" stroke={C.cream} strokeWidth={3} />
      </g>
      <path d={MAP} {...LINE} />
      <path d="M120 44L120 196M200 64L200 216" {...LINE} strokeWidth={2.4} />

      {/* trees */}
      {[[232, 104], [250, 150], [92, 168]].map(([x, y]) => (
        <g key={x}>
          <path d={pd`M${x} ${y}V${y + 8}`} {...LINE} strokeWidth={2.2} />
          <path d={wobCircle(x, y - 4, 7, x)} fill={C.teal2} {...S} strokeWidth={2.2} />
        </g>
      ))}

      <DrawReveal id={maskId} d={ROUTE} on={on} width={14} delay={0.2}>
        <path d={ROUTE} {...LINE} stroke={C.coral} strokeWidth={3.6} strokeDasharray="8 8" />
      </DrawReveal>

      <path d={wobCircle(66, 186, 7, 2)} fill={C.teal} {...S} strokeWidth={2.4} />
      <circle cx="66" cy="186" r="2.2" fill={C.cream} />

      <g transform="translate(132 142) scale(0.7)">
        <path d={PIN} fill={C.orange} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx="0" cy="-28" r="6" fill={C.cream} stroke={INK} strokeWidth={3.4} />
      </g>

      <ellipse cx="248" cy="81" rx="9" ry="3.2" fill={INK} fillOpacity={0.22} />
      <Anim on={on} cls="animate-float" dur={2.8}>
        <g transform="translate(248 80)">
          <path d={PIN} fill={C.coral} {...S} />
          <path d={wobCircle(0, -28, 7.5, 3)} fill={C.cream} {...S} strokeWidth={2.4} />
          <path d="M-8 -36Q-6 -40 -2 -41" stroke={C.cream} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      </Anim>

      <Twinkle x={286} y={28} s={11} on={on} />
      <Twinkle x={30} y={36} s={8} fill={C.pink} on={on} delay={1} />
      <Twinkle x={300} y={222} s={6} fill={C.teal2} on={on} delay={1.8} />
    </Svg>
  );
}
