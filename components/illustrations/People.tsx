import { Anim, C, Head, INK, LINE, S, Svg, Tube, Twinkle, draw, rays, scallop, smooth, wobCircle, wrect, bubble, type IllustrationProps } from './shared';

/* ------------------------------------------------------------------ */
/* LaptopWorker                                                        */
/* ------------------------------------------------------------------ */

export function LaptopWorker({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Person working on a laptop with AI sparkles and a chat bubble">
      <path d={smooth([[70, 70], [150, 40], [238, 60], [262, 140], [214, 184], [104, 188], [50, 142]])} fill={C.lav} />
      <path d="M52 202L46 238M268 202L274 238" {...LINE} strokeWidth={3} />

      {/* head nods gently */}
      <Anim on={on} cls="animate-wiggle" origin="center bottom" dur={5}>
        <path d="M150 110L150 138L170 138L170 110Z" fill={C.skin2} {...S} />
        <Head x={160} y={96} r={24} skin={C.skin2} hair="puff" on={on} seed={4} />
      </Anim>
      <path d="M102 194C100 158 118 134 160 132C202 134 220 158 218 194Z" fill={C.orange} {...S} />
      <path d="M147 134L160 148L173 134" {...LINE} strokeWidth={2.4} />
      <Tube d="M116 152C104 168 104 182 112 190" color={C.orange} w={12} />
      <Tube d="M204 152C216 168 216 182 208 190" color={C.orange} w={12} />

      {/* desk */}
      <path d="M22 190C100 185 220 185 298 190L294 204C220 200 100 200 26 204Z" fill={C.sand} {...S} />

      {/* laptop, back facing us */}
      <path d={wrect(112, 124, 96, 62, 7)} fill={C.lav2} transform="translate(5 4)" />
      <path d={wrect(112, 124, 96, 62, 7)} fill={C.teal} {...S} />
      <path d="M122 134Q126 131 132 131" stroke={C.teal2} strokeWidth={3} strokeLinecap="round" />
      <Anim on={on} cls="animate-spin-slow" dur={9}>
        <path d="M160 145C161 151 163 153 169 154C163 155 161 157 160 163C159 157 157 155 151 154C157 153 159 151 160 145Z" fill={C.orange} {...S} strokeWidth={2} />
      </Anim>
      <path d="M98 186L222 186L228 196L92 196Z" fill={C.cream} {...S} />
      <path d={wobCircle(112, 189, 8, 2)} fill={C.skin2} {...S} />
      <path d={wobCircle(208, 189, 8, 5)} fill={C.skin2} {...S} />

      {/* mug with steam */}
      <path d="M66 166C77 165 77 181 66 181" {...LINE} />
      <path d={wrect(40, 158, 26, 30, 5)} fill={C.coral} {...S} />
      <path d="M46 170H60" stroke={C.cream} strokeWidth={2.4} strokeLinecap="round" />
      <Anim on={on} cls="animate-float" dur={3}>
        <path d="M48 150C44 144 52 140 48 134M58 150C54 144 62 140 58 132" {...LINE} strokeWidth={2.2} />
      </Anim>

      {/* plant */}
      <Anim on={on} cls="animate-wiggle" origin="center bottom" dur={4} delay={0.6}>
        <path d="M275 168C262 152 262 138 270 132C279 142 281 156 275 168Z" fill={C.teal2} {...S} strokeWidth={2.4} />
        <path d="M275 168C286 154 298 149 303 151C301 161 291 169 275 168Z" fill={C.teal2} {...S} strokeWidth={2.4} />
        <path d="M275 168C268 158 255 153 250 155C252 165 264 171 275 168Z" fill={C.teal2} {...S} strokeWidth={2.4} />
      </Anim>
      <path d="M262 166L288 166L284 188L266 188Z" fill={C.pink} {...S} />

      {/* motion lines */}
      <path d="M124 70L116 62M119 86L109 84M198 66L206 58" {...LINE} strokeWidth={2.2} />

      {/* chat bubble */}
      <Anim on={on} cls="animate-float" dur={6}>
        <path d={bubble(224, 22, 82, 50, 14, 12, 14, -8, 16)} fill={C.lav2} transform="translate(5 5)" />
        <path d={bubble(224, 22, 82, 50, 14, 12, 14, -8, 16)} fill={C.white} {...S} />
        {[247, 265, 283].map((cx, i) => (
          <Anim key={cx} on={on} cls="animate-ghost-pulse" delay={i * 0.3} dur={1.5}>
            <circle cx={cx} cy={47} r={4.8} fill={C.teal} />
          </Anim>
        ))}
      </Anim>

      <Twinkle x={52} y={58} s={14} on={on} />
      <Twinkle x={86} y={32} s={8} fill={C.pink} on={on} delay={0.8} />
      <Twinkle x={30} y={104} s={6} fill={C.coral} on={on} delay={1.5} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* FarmerPhone                                                         */
/* ------------------------------------------------------------------ */

function Maize({ on, delay = 0 }: { on: boolean; delay?: number }) {
  return (
    <Anim on={on} cls="animate-wiggle" origin="center bottom" dur={4.5} delay={delay}>
      <Tube d="M284 246C286 200 280 150 286 98" color={C.teal2} w={5} />
      <path d="M285 192C300 177 312 176 318 182C306 187 296 193 285 198Z" fill={C.teal2} {...S} strokeWidth={2.4} />
      <path d="M283 164C266 149 254 148 248 153C260 158 272 164 283 170Z" fill={C.teal2} {...S} strokeWidth={2.4} />
      <path d="M285 128C298 113 308 109 314 111C306 121 296 130 285 136Z" fill={C.teal2} {...S} strokeWidth={2.4} />
      <path d="M283 152C274 139 276 121 285 114C293 122 294 140 287 152Z" fill={C.orange} {...S} strokeWidth={2.4} />
      <path d="M281 124H289M280 132H290M281 140H289" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M283 154C278 142 276 132 279 124C282 136 285 146 288 154Z" fill={C.teal2} {...S} strokeWidth={2} />
      <path d="M286 98L279 85M286 98L288 82M286 98L295 87" {...LINE} strokeWidth={2.2} />
    </Anim>
  );
}

export function FarmerPhone({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Farmer in a wide hat using a phone among maize plants">
      <path d={smooth([[98, 92], [170, 62], [248, 92], [262, 170], [200, 214], [112, 208], [80, 150]])} fill={C.lav} />

      {/* sun */}
      <Anim on={on} cls="animate-spin-slow" dur={24}>
        <path d={rays(58, 54, 29, 38, 10)} {...LINE} strokeWidth={2.6} />
      </Anim>
      <path d={wobCircle(58, 54, 21, 7)} fill={C.orange} {...S} />
      <circle cx="51" cy="52" r="1.8" fill={INK} />
      <circle cx="65" cy="52" r="1.8" fill={INK} />
      <path d="M53 60Q58 64 63 60" {...LINE} strokeWidth={2} />

      <Anim on={on} cls="animate-float" dur={4}>
        <path d="M116 44Q122 38 128 44Q134 38 140 44" {...LINE} strokeWidth={2.2} />
      </Anim>

      {/* hills */}
      <path d="M-4 198C60 178 120 184 180 194C230 202 280 186 324 178L324 246L-4 246Z" fill={C.sand} {...S} />
      <path d="M18 224Q58 216 98 220M222 226Q262 218 302 222" {...LINE} strokeWidth={2} />

      <Maize on={on} />
      <g transform="translate(314 14) scale(-1 1)">
        <Maize on={on} delay={1.2} />
      </g>

      {/* farmer */}
      <path d="M150 146L150 174L170 174L170 146Z" fill={C.skin1} {...S} />
      <path d="M104 246C104 198 120 172 160 170C200 172 216 198 216 246Z" fill={C.coral} {...S} />
      <path d="M137 246L139 204C152 201 168 201 181 204L183 246Z" fill={C.teal} {...S} />
      <Tube d="M140 204L128 177" color={C.teal} w={5} sw={2.4} />
      <Tube d="M180 204L192 177" color={C.teal} w={5} sw={2.4} />
      <circle cx="143" cy="211" r="2.6" fill={C.cream} />
      <circle cx="177" cy="211" r="2.6" fill={C.cream} />
      <path d="M150 226H170" stroke={C.teal2} strokeWidth={3} strokeLinecap="round" />
      <Tube d="M118 186C108 206 108 224 112 246" color={C.coral} w={13} />

      <Head x={160} y={136} r={25} skin={C.skin1} hair="none" on={on} seed={6} />
      {/* straw hat */}
      <path d="M92 118C94 106 226 104 229 116C231 128 190 126 160 126C128 126 90 130 92 118Z" fill={C.cream} {...S} />
      <path d="M126 114C124 90 136 78 160 78C184 78 196 90 194 114C180 118 140 118 126 114Z" fill={C.cream} {...S} />
      <path d="M126 105C140 109 180 109 194 105L194 113C180 117 140 117 126 113Z" fill={C.wine} {...S} strokeWidth={2.2} />
      <path d="M108 118L115 119M212 116L205 117M150 90L156 89M170 94L176 93" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />

      {/* arm + phone */}
      <Anim on={on} cls="animate-wiggle" origin="left bottom" dur={3.4}>
        <Tube d="M202 188C220 202 234 192 234 172" color={C.coral} w={13} />
        <path d={wrect(220, 118, 28, 50, 6)} fill={C.teal} {...S} />
        <path d={wrect(224, 124, 20, 36, 3, 0.8)} fill={C.lav} stroke={INK} strokeWidth={1.8} />
        <path d="M234 152C227 146 229 137 238 134C240 143 238 149 234 152Z" fill={C.teal2} {...S} strokeWidth={1.8} />
        <path d="M234 152L236 142" {...LINE} strokeWidth={1.4} />
        <path d={wobCircle(233, 168, 9, 3)} fill={C.skin1} {...S} />
        <path d="M225 160C221 153 226 148 231 153" fill={C.skin1} {...S} strokeWidth={2.4} />
      </Anim>
      <Anim on={on} cls="animate-ghost-pulse">
        <path d="M254 118Q261 112 259 102M261 126Q273 116 269 98" {...LINE} stroke={C.coral} strokeWidth={3} />
      </Anim>

      <Twinkle x={250} y={40} s={9} fill={C.pink} on={on} delay={0.5} />
      <Twinkle x={100} y={78} s={6} on={on} delay={1.4} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* NurseTablet                                                         */
/* ------------------------------------------------------------------ */

export function NurseTablet({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Nurse holding a tablet showing a heartbeat line">
      <path d={smooth([[84, 80], [160, 50], [244, 72], [270, 150], [224, 208], [104, 212], [60, 146]])} fill={C.pink} />

      <Anim on={on} cls="animate-ghost-pulse">
        <path d="M252 54V70M244 62H260" {...LINE} stroke={C.teal2} strokeWidth={3.4} />
      </Anim>
      <Anim on={on} cls="animate-ghost-pulse" delay={1.2}>
        <path d="M40 172V184M34 178H46" {...LINE} stroke={C.teal2} strokeWidth={3} />
      </Anim>

      {/* floating heart */}
      <Anim on={on} cls="animate-float" dur={4}>
        <path d="M72 100C52 86 50 66 64 64C68 64 71 67 72 70C73 67 76 64 80 64C94 66 92 86 72 100Z" fill={C.coral} {...S} />
        <path d="M60 74Q61 69 65 68" stroke={C.cream} strokeWidth={2.4} strokeLinecap="round" />
        <path d="M44 62L38 58M46 76L39 77M98 58L104 53" {...LINE} strokeWidth={2} />
      </Anim>

      {/* pill */}
      <Anim on={on} cls="animate-wiggle" dur={3}>
        <path d="M262 126L282 106" stroke={INK} strokeWidth={17} strokeLinecap="round" />
        <path d="M262 126L272 116" stroke={C.cream} strokeWidth={11} strokeLinecap="round" />
        <path d="M272 116L282 106" stroke={C.orange} strokeWidth={11} strokeLinecap="round" />
        <path d="M268 110L278 120" {...LINE} strokeWidth={2.4} />
      </Anim>

      {/* nurse */}
      <path d="M151 128L151 164L169 164L169 128Z" fill={C.skin2} {...S} />
      <Head x={160} y={114} r={24} skin={C.skin2} hair="bun" on={on} seed={8} />
      <path d="M142 93C141 84 179 84 178 93L176 99C166 97 154 97 144 99Z" fill={C.white} {...S} strokeWidth={2.4} />
      <path d="M160 87V95M156 91H164" stroke={C.coral} strokeWidth={2.4} strokeLinecap="round" />

      <path d="M96 246C96 192 116 162 160 160C204 162 224 192 224 246Z" fill={C.teal2} {...S} />
      <path d="M144 162L160 184L176 162Z" fill={C.skin2} {...S} strokeWidth={2.4} />
      <path d="M142 166C130 186 132 206 146 214" {...LINE} strokeWidth={2.6} />
      <path d={wobCircle(147, 220, 6, 4)} fill={C.sand} {...S} strokeWidth={2.4} />
      <path d="M112 212H132M120 212V202" {...LINE} strokeWidth={2.4} />
      <path d="M126 212V200" stroke={C.coral} strokeWidth={3} strokeLinecap="round" />

      <Tube d="M112 184C114 214 150 226 178 212" color={C.teal2} w={13} />
      <Tube d="M212 180C230 196 250 196 258 186" color={C.teal2} w={13} />

      {/* tablet */}
      <path d={wrect(174, 146, 84, 64, 8)} fill={C.lav2} transform="translate(6 6)" />
      <path d={wrect(174, 146, 84, 64, 8)} fill={C.teal} {...S} />
      <path d={wrect(181, 153, 70, 50, 4, 0.8)} fill={C.cream} stroke={INK} strokeWidth={2} />
      <path d="M186 180L200 180L206 168L215 195L224 160L231 180L246 180" {...LINE} stroke={C.coral} strokeWidth={3} {...draw(on, 0.3, 2.8)} />
      <path d="M188 196H206" stroke={C.teal2} strokeWidth={2.4} strokeLinecap="round" />
      <path d={wobCircle(180, 211, 8.5, 2)} fill={C.skin2} {...S} />
      <path d={wobCircle(258, 184, 8.5, 6)} fill={C.skin2} {...S} />

      <Twinkle x={238} y={30} s={8} on={on} delay={0.7} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* TeacherBoard                                                        */
/* ------------------------------------------------------------------ */

export function TeacherBoard({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Teacher pointing at a board with a bar chart">
      <path d="M8 228C100 222 220 224 312 228" {...LINE} strokeWidth={2.4} />
      <path d="M64 150L52 222M170 150L182 222M58 190H176" {...LINE} strokeWidth={3} />

      {/* board */}
      <path d={wrect(34, 36, 166, 116, 10)} fill={C.lav2} transform="translate(8 8)" />
      <path d={wrect(34, 36, 166, 116, 10)} fill={C.sand} {...S} />
      <path d={wrect(44, 46, 146, 96, 5, 1)} fill={C.teal} {...S} strokeWidth={2.4} />
      <path d="M58 60V128H172" stroke={C.cream} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={wrect(66, 104, 16, 24, 3, 0.6)} fill={C.cream} stroke={INK} strokeWidth={2} />
      <path d={wrect(92, 90, 16, 38, 3, 0.6)} fill={C.cream} stroke={INK} strokeWidth={2} />
      <path d={wrect(118, 98, 16, 30, 3, 0.6)} fill={C.cream} stroke={INK} strokeWidth={2} />
      <path d={wrect(144, 72, 16, 56, 3, 0.6)} fill={C.orange} stroke={INK} strokeWidth={2} />
      <path d="M70 94L99 78L124 86L150 58" {...LINE} stroke={C.pink} strokeWidth={2.8} {...draw(on, 0.4)} />
      <path d="M140 57L150 58L149 68" {...LINE} stroke={C.pink} strokeWidth={2.8} {...draw(on, 1.6)} />
      <path d={wrect(40, 148, 154, 8, 3, 0.6)} fill={C.sand} {...S} strokeWidth={2.4} />
      <path d="M60 148H72" stroke={C.cream} strokeWidth={4} strokeLinecap="round" />

      {/* books + apple */}
      <path d={wrect(90, 208, 60, 13, 3, 0.8)} fill={C.coral} {...S} strokeWidth={2.4} />
      <path d={wrect(96, 195, 50, 13, 3, 0.8)} fill={C.orange} {...S} strokeWidth={2.4} />
      <path d="M140 199V204" {...LINE} strokeWidth={1.8} />
      <path d={wobCircle(121, 185, 9, 3)} fill={C.coral} {...S} strokeWidth={2.4} />
      <path d="M121 176C122 170 128 168 132 170C130 175 125 177 121 176Z" fill={C.teal2} {...S} strokeWidth={2} />

      {/* pointing arm */}
      <Anim on={on} cls="animate-wiggle" origin="right bottom" dur={3.2}>
        <Tube d="M198 124L156 62" color={C.wine} w={3.5} sw={2.2} />
        <Tube d="M222 128C212 132 206 130 198 125" color={C.lav2} w={12} />
        <path d={wobCircle(197, 124, 7, 9)} fill={C.skin3} {...S} strokeWidth={2.4} />
        <path d="M146 52L140 46M144 66L136 68" {...LINE} strokeWidth={2.2} />
      </Anim>

      {/* teacher */}
      <path d="M236 94L236 116L252 116L252 94Z" fill={C.skin3} {...S} />
      <Head x={244} y={84} r={21} skin={C.skin3} hair="wrap" wrap={C.wine} on={on} seed={11} mouth="open" />
      <Tube d="M270 130C286 148 284 166 270 170" color={C.lav2} w={12} />
      <path d="M212 198C210 146 220 114 244 112C268 114 278 146 276 198Z" fill={C.lav2} {...S} />
      <path d="M236 114Q244 124 252 114" {...LINE} strokeWidth={2.2} />
      <path d={wobCircle(269, 170, 6.5, 2)} fill={C.skin3} {...S} strokeWidth={2.4} />
      <Tube d="M231 214L229 226" color={C.skin3} w={6} sw={2.4} />
      <Tube d="M257 214L259 226" color={C.skin3} w={6} sw={2.4} />
      <path d="M212 190C232 186 256 186 276 190L286 214C258 220 230 220 202 214Z" fill={C.teal2} {...S} />
      <ellipse cx="226" cy="230" rx="9" ry="4.5" fill={INK} />
      <ellipse cx="262" cy="230" rx="9" ry="4.5" fill={INK} />

      <Twinkle x={290} y={40} s={11} on={on} />
      <Twinkle x={20} y={22} s={7} fill={C.pink} on={on} delay={1} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* TeamIdeas                                                           */
/* ------------------------------------------------------------------ */

export function TeamIdeas({ className, animated = true }: IllustrationProps) {
  const on = animated;
  return (
    <Svg className={className} label="Three colleagues around a table sharing a bright idea">
      <path d={smooth([[70, 40], [160, 10], [260, 36], [276, 110], [200, 140], [110, 140], [44, 106]])} fill={C.lav} />

      {/* idea cloud */}
      <Anim on={on} cls="animate-float" dur={5}>
        <path d={scallop(160, 48, 62, 28, 8, 0.1, 3)} fill={C.lav2} transform="translate(5 5)" />
        <path d={scallop(160, 48, 62, 28, 8, 0.1, 3)} fill={C.white} {...S} />
        <path d={wobCircle(160, 42, 13, 2)} fill={C.orange} {...S} />
        <path d="M154 44L158 39L162 45L166 40" {...LINE} strokeWidth={1.8} />
        <path d={wrect(153, 54, 14, 9, 2, 0.5)} fill={C.sand} {...S} strokeWidth={2.2} />
        <path d="M153 58.5H167" {...LINE} strokeWidth={1.6} />
        <Anim on={on} cls="animate-ghost-pulse" dur={2}>
          <path d="M139 42H132M181 42H188M145 29L140 24M175 29L180 24" {...LINE} stroke={C.coral} strokeWidth={2.6} />
        </Anim>
      </Anim>
      <circle cx="122" cy="90" r="4" fill={C.white} {...S} strokeWidth={2.2} />
      <circle cx="112" cy="80" r="2.6" fill={C.white} {...S} strokeWidth={2} />

      {/* left person */}
      <path d="M74 140L74 154L90 154L90 140Z" fill={C.skin2} {...S} />
      <Head x={82} y={128} r={20} skin={C.skin2} hair="crop" on={on} seed={2} />
      <path d="M44 198C44 164 58 150 82 150C106 150 120 164 120 198Z" fill={C.teal2} {...S} />

      {/* right person with raised hand */}
      <Anim on={on} cls="animate-wiggle" origin="left bottom" dur={2.4}>
        <Tube d="M264 166C281 150 286 130 280 112" color={C.lav2} w={11} />
        <path d={wobCircle(279, 106, 8, 5)} fill={C.skin1} {...S} />
        <path d="M290 94L296 88M292 106L300 106" {...LINE} strokeWidth={2} />
      </Anim>
      <path d="M230 140L230 154L246 154L246 140Z" fill={C.skin1} {...S} />
      <Head x={238} y={128} r={20} skin={C.skin1} hair="wrap" wrap={C.orange} on={on} seed={7} />
      <path d="M200 198C200 164 214 150 238 150C262 150 276 164 276 198Z" fill={C.lav2} {...S} />

      {/* middle person */}
      <path d="M151 132L151 150L169 150L169 132Z" fill={C.skin3} {...S} />
      <Head x={160} y={122} r={22} skin={C.skin3} hair="puff" on={on} seed={5} mouth="open" />
      <path d="M118 198C118 162 134 146 160 146C186 146 202 162 202 198Z" fill={C.coral} {...S} />
      <path d="M150 148L160 160L170 148" {...LINE} strokeWidth={2.2} />

      {/* table */}
      <path d="M50 216L46 246M270 216L274 246" {...LINE} strokeWidth={3} />
      <path d="M24 196L26 212C80 226 240 226 294 212L296 196Z" fill={C.sand} {...S} />
      <path d="M24 196C24 182 296 182 296 196C296 210 24 210 24 196Z" fill={C.cream} {...S} />
      <path d="M108 192L144 186L149 199L112 205Z" fill={C.white} {...S} strokeWidth={2.2} />
      <path d="M116 195L138 191M118 200L132 198" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M182 186L198 185L199 197L183 198Z" fill={C.pink} {...S} strokeWidth={2.2} />
      <path d="M244 184C250 184 250 192 244 192" {...LINE} strokeWidth={2.2} />
      <path d={wrect(230, 180, 14, 16, 3, 0.5)} fill={C.orange} {...S} strokeWidth={2.2} />
      <path d={wobCircle(70, 196, 7, 1)} fill={C.skin2} {...S} strokeWidth={2.4} />
      <path d={wobCircle(96, 198, 7, 3)} fill={C.skin2} {...S} strokeWidth={2.4} />
      <path d={wobCircle(214, 196, 7, 4)} fill={C.skin1} {...S} strokeWidth={2.4} />

      <Twinkle x={36} y={52} s={11} on={on} />
      <Twinkle x={292} y={48} s={8} fill={C.pink} on={on} delay={0.9} />
      <Twinkle x={250} y={22} s={5} fill={C.coral} on={on} delay={1.6} />
    </Svg>
  );
}
