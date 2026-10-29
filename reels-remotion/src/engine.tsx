import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ===== Tipos =====
export type Motion = 'snappy' | 'smooth' | 'kinetic';
export type Deco = 'road' | 'paper' | 'flash';

export type Theme = {
  bg: string; // CSS background
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  bandBg: string;
  bandText: string;
  display: string; // fonte dos títulos grandes
  displayWeight: number;
  sans: string;
  motion: Motion;
  deco: Deco;
};

type Base = {kicker: string; dur: number};
export type SceneDef =
  | (Base & {type: 'hero'; big: string; size?: number; band?: string; support?: [string, string, string]})
  | (Base & {type: 'count'; to: number; unit: string; support: [string, string, string]})
  | (Base & {type: 'list'; title?: string; items: string[]; icon?: 'check' | 'dot'})
  | (Base & {type: 'strike'; before: string; struck: string; after: string; support: [string, string, string]})
  | (Base & {type: 'dots'; n: number; big: string; support: [string, string, string]})
  | (Base & {type: 'flash'; words: string[]; support?: [string, string, string]});

export type ReelDef = {
  theme: Theme;
  scenes: SceneDef[];
  cta: {line: [string, string, string]; dur: number};
};

export const totalFrames = (r: ReelDef) =>
  r.scenes.reduce((s, x) => s + x.dur, 0) + r.cta.dur;

// ===== Constantes de layout (área segura 1080x1920) =====
const L = 70;
const W = 780;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ThemeCtx = React.createContext<Theme | null>(null);
const useTheme = () => React.useContext(ThemeCtx)!;

// spring com caráter de cada estilo de movimento
const useEnter = (delay: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const cfg =
    t.motion === 'snappy'
      ? {damping: 14, stiffness: 220, mass: 0.6}
      : t.motion === 'kinetic'
      ? {damping: 9, stiffness: 260, mass: 0.5}
      : {damping: 200, stiffness: 90};
  return spring({frame: frame - delay, fps, config: cfg});
};

// ===== Decorações de fundo =====
const Decoration: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  if (t.deco === 'road') {
    // faixas de pista descendo à direita
    const off = (frame * 14) % 160;
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', right: 120, top: 0, bottom: 0, width: 4, background: t.accent, opacity: 0.18}} />
        {Array.from({length: 16}).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              right: 180,
              top: i * 160 - 160 + off,
              width: 14,
              height: 80,
              background: t.accent,
              opacity: 0.22,
              borderRadius: 3,
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }
  if (t.deco === 'paper') {
    // folha com pautas finas e margem
    return (
      <AbsoluteFill>
        {Array.from({length: 28}).map((_, i) => (
          <div
            key={i}
            style={{position: 'absolute', left: 0, right: 0, top: 120 + i * 64, height: 1, background: t.muted, opacity: 0.18}}
          />
        ))}
        <div style={{position: 'absolute', left: 44, top: 0, bottom: 0, width: 2, background: t.accent2, opacity: 0.35}} />
      </AbsoluteFill>
    );
  }
  // flash: brilhos diagonais varrendo
  const x = interpolate(frame % 150, [0, 150], [-600, 1500]);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: -400,
          width: 160,
          height: 2800,
          transform: 'rotate(25deg)',
          background: `linear-gradient(90deg, transparent, ${t.accent}33, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -160,
          top: 380,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${t.accent2}55 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC = () => {
  const t = useTheme();
  return (
    <>
      <div style={{position: 'absolute', left: L, top: 190, width: 110, height: 4, background: t.accent}} />
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: L,
          fontFamily: 'Lora, serif',
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 6,
          color: t.text,
          opacity: 0.85,
        }}
      >
        SOUZA <span style={{color: t.accent}}>&amp;</span> REIS
      </div>
    </>
  );
};

// ===== Peças comuns =====
const Kicker: React.FC<{text: string}> = ({text}) => {
  const t = useTheme();
  const p = useEnter(0);
  return (
    <div
      style={{
        position: 'absolute',
        left: L,
        bottom: 1920 - 580,
        width: W,
        lineHeight: 1.25,
        fontFamily: t.sans,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: interpolate(p, [0, 1], [12, 4]),
        color: t.accent,
        opacity: Math.min(1, p),
      }}
    >
      {text}
    </div>
  );
};

const Support: React.FC<{s: [string, string, string]; delay?: number; top?: number}> = ({s, delay = 28, top = 1285}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useEnter(delay);
  const hl = spring({frame: frame - delay - 20, fps, config: {damping: 7, stiffness: 180}});
  const k = Math.sin(Math.min(1, hl) * Math.PI);
  return (
    <div
      style={{
        position: 'absolute',
        left: L,
        top,
        width: W,
        fontFamily: t.sans,
        fontWeight: 600,
        fontSize: 44,
        lineHeight: 1.3,
        color: t.text,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {s[0].endsWith(' ') ? s[0].slice(0, -1) + '\u00a0' : s[0]}
      <span
        style={{
          display: 'inline-block',
          color: t.accent,
          fontSize: `${1 + 0.18 * k}em`,
          lineHeight: 1,
          textShadow: `0 0 ${18 * k}px ${t.accent}AA`,
        }}
      >
        {s[1]}
      </span>
      {s[2].startsWith(' ') ? '\u00a0' + s[2].slice(1) : s[2]}
    </div>
  );
};

const Band: React.FC<{text: string; variant: number}> = ({text, variant}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(18);
  const v = variant % 3;
  const transform =
    v === 0 ? `translateX(${(Math.min(1, p) - 1) * 110}%)` : v === 1 ? `translateX(${(1 - Math.min(1, p)) * 110}%)` : 'none';
  const clip = v === 2 ? `inset(0 ${Math.max(0, (1 - p) * 100)}% 0 0)` : 'none';
  const breathe = frame > 30 ? 1 + 0.015 * Math.sin((frame - 30) / 8) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: L - 10,
        bottom: 1920 - 1250,
        width: W + 20,
        overflow: 'hidden',
        transform: `scale(${breathe})`,
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          background: t.bandBg,
          padding: '26px 30px',
          transform,
          clipPath: clip,
          fontFamily: t.sans,
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1.1,
          color: t.bandText,
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const bigBase = (t: Theme, size: number): React.CSSProperties => ({
  position: 'absolute',
  left: L,
  top: 610,
  width: W,
  fontFamily: t.display,
  fontWeight: t.displayWeight,
  fontSize: size,
  lineHeight: 1.05,
  color: t.text,
  transformOrigin: 'left center',
});

// título grande com entrada variada por índice
const BigEntrance: React.FC<{text: string; size: number; variant: number}> = ({text, size, variant}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(4);
  const base = bigBase(t, size);
  const v = variant % 5;
  if (v === 0) {
    // palavra por palavra
    return (
      <div style={base}>
        {text.split(' ').map((w, i) => {
          const sp = Math.min(1.05, interpolate(frame, [4 + i * 5, 16 + i * 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))}));
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.25em', opacity: Math.min(1, sp * 1.5), transform: `translateY(${(1 - sp) * 80}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
    );
  }
  if (v === 1) {
    // zoom de impacto
    return <div style={{...base, opacity: interpolate(frame, [4, 9], [0, 1], clamp), transform: `scale(${interpolate(p, [0, 1], [2.4, 1])})`}}>{text}</div>;
  }
  if (v === 2) {
    // desfoque abrindo
    const q = interpolate(frame, [4, 24], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
    return <div style={{...base, opacity: q, filter: `blur(${(1 - q) * 22}px)`, transform: `scale(${1.3 - 0.3 * q})`}}>{text}</div>;
  }
  if (v === 3) {
    // máscara subindo
    return (
      <div style={{...base, clipPath: `inset(${(1 - Math.min(1, p)) * 100}% 0 0 0)`, transform: `translateY(${(1 - p) * 50}px)`}}>{text}</div>
    );
  }
  // deslize com inclinação
  return <div style={{...base, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 600}px) skewX(${(1 - p) * -12}deg)`}}>{text}</div>;
};

// ===== Cenas =====
const Hero: React.FC<{s: Extract<SceneDef, {type: 'hero'}>; i: number}> = ({s, i}) => (
  <>
    <Kicker text={s.kicker} />
    <BigEntrance text={s.big} size={s.size ?? 150} variant={i} />
    {s.band && <Band text={s.band} variant={i} />}
    {s.support && <Support s={s.support} delay={s.band ? 28 : 18} top={s.band ? 1285 : 1150} />}
  </>
);

const Count: React.FC<{s: Extract<SceneDef, {type: 'count'}>}> = ({s}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const prog = interpolate(frame, [4, 34], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const pulse = spring({frame: frame - 36, fps, config: {damping: 8, stiffness: 200}});
  const k = 1 + 0.14 * Math.sin(Math.min(1, pulse) * Math.PI);
  return (
    <>
      <Kicker text={s.kicker} />
      <div style={{...bigBase(t, 260), top: 590, opacity: interpolate(frame, [2, 8], [0, 1], clamp)}}>
        <span style={{display: 'inline-block', color: t.accent, transform: `scale(${k})`, transformOrigin: 'left bottom'}}>
          {Math.round(s.to * prog)}
        </span>
        <span style={{fontSize: 110, marginLeft: 24}}>{s.unit}</span>
      </div>
      <Support s={s.support} delay={22} top={1000} />
    </>
  );
};

const List: React.FC<{s: Extract<SceneDef, {type: 'list'}>}> = ({s}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      <Kicker text={s.kicker} />
      {s.title && <BigEntrance text={s.title} size={110} variant={3} />}
      {s.items.map((it, i) => {
        const d = 14 + i * 12;
        const p = spring({frame: frame - d, fps, config: {damping: 13, stiffness: 200}});
        const tick = interpolate(frame, [d + 6, d + 16], [0, 1], clamp);
        const top = (s.title ? 800 : 640) + i * 132;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: L,
              top,
              width: W,
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              opacity: Math.min(1, p),
              transform: `translateX(${(1 - p) * -120}px) scale(${0.9 + 0.1 * Math.min(1, p)})`,
              transformOrigin: 'left center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: s.icon === 'dot' ? '50%' : 14,
                background: t.bandBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {s.icon === 'dot' ? (
                <div style={{width: 24, height: 24, borderRadius: '50%', background: t.bandText, transform: `scale(${tick})`}} />
              ) : (
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <path
                    d="M8 23 L18 33 L37 11"
                    fill="none"
                    stroke={t.bandText}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50"
                    strokeDashoffset={50 * (1 - tick)}
                  />
                </svg>
              )}
            </div>
            <div style={{fontFamily: t.sans, fontWeight: 700, fontSize: 48, lineHeight: 1.15, color: t.text}}>{it}</div>
          </div>
        );
      })}
    </>
  );
};

const Strike: React.FC<{s: Extract<SceneDef, {type: 'strike'}>}> = ({s}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(4);
  const line = interpolate(frame, [26, 38], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const shake = frame > 38 && frame < 48 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <>
      <Kicker text={s.kicker} />
      <div style={{...bigBase(t, 120), opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px) translateX(${shake}px)`}}>
        {s.before}
        <span style={{position: 'relative', display: 'inline-block', color: line > 0.5 ? t.muted : t.text}}>
          {s.struck}
          <span
            style={{
              position: 'absolute',
              left: -6,
              top: '52%',
              height: 12,
              width: `calc(${line * 100}% + 12px)`,
              background: t.accent2,
              borderRadius: 6,
              transform: 'rotate(-3deg)',
            }}
          />
        </span>
        {s.after}
      </div>
      <Support s={s.support} delay={44} top={1150} />
    </>
  );
};

const Dots: React.FC<{s: Extract<SceneDef, {type: 'dots'}>}> = ({s}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useEnter(2);
  return (
    <>
      <Kicker text={s.kicker} />
      <div style={{...bigBase(t, 220), top: 600, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`, opacity: Math.min(1, p)}}>
        {s.big}
      </div>
      <div style={{position: 'absolute', left: L, top: 900, display: 'flex', gap: 22}}>
        {Array.from({length: s.n}).map((_, i) => {
          const d = spring({frame: frame - 16 - i * 5, fps, config: {damping: 9, stiffness: 240}});
          return (
            <div
              key={i}
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                border: `4px solid ${t.accent}`,
                background: d > 0.5 ? t.accent : 'transparent',
                transform: `scale(${0.4 + 0.6 * Math.min(1.1, d)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: t.sans,
                fontWeight: 900,
                fontSize: 36,
                color: d > 0.5 ? t.bandText : t.accent,
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      <Support s={s.support} delay={16 + s.n * 5} top={1060} />
    </>
  );
};

const Flash: React.FC<{s: Extract<SceneDef, {type: 'flash'}>}> = ({s}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const per = Math.floor((s.dur - (s.support ? 40 : 10)) / s.words.length);
  const idx = Math.min(s.words.length - 1, Math.floor(Math.max(0, frame - 4) / per));
  const local = Math.max(0, frame - 4) - idx * per;
  const pop = interpolate(local, [0, 5], [1.5, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const flashOp = interpolate(local, [0, 3], [0.5, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{background: t.accent, opacity: frame > 4 ? flashOp : 0}} />
      <Kicker text={s.kicker} />
      <div style={{...bigBase(t, 170), transform: `scale(${pop})`, color: idx % 2 ? t.accent : t.text}}>{s.words[idx]}</div>
      <div style={{position: 'absolute', left: L, top: 860, display: 'flex', gap: 14}}>
        {s.words.map((_, i) => (
          <div key={i} style={{width: 46, height: 8, borderRadius: 4, background: i <= idx ? t.accent : t.muted, opacity: i <= idx ? 1 : 0.35}} />
        ))}
      </div>
      {s.support && <Support s={s.support} delay={s.words.length * per} top={1000} />}
    </>
  );
};

// ===== Transições e montagem =====
const SceneWrap: React.FC<{s: SceneDef; i: number}> = ({s, i}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const push = interpolate(frame, [0, s.dur], [1, 1.06], clamp);
  const o = interpolate(frame, [s.dur - 12, s.dur], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const mode = (i + (t.motion === 'kinetic' ? 1 : 0)) % 3;
  const out =
    mode === 0 ? `scale(${1 + o * 0.5})` : mode === 1 ? `translateX(${-o * 420}px)` : `translateY(${-o * 300}px) rotate(${-o * 4}deg)`;
  let body: React.ReactNode = null;
  if (s.type === 'hero') body = <Hero s={s} i={i} />;
  if (s.type === 'count') body = <Count s={s} />;
  if (s.type === 'list') body = <List s={s} />;
  if (s.type === 'strike') body = <Strike s={s} />;
  if (s.type === 'dots') body = <Dots s={s} />;
  if (s.type === 'flash') body = <Flash s={s} />;
  return <AbsoluteFill style={{opacity: 1 - o, transform: `${out} scale(${push})`, transformOrigin: '40% 50%'}}>{body}</AbsoluteFill>;
};

const Cta: React.FC<{line: [string, string, string]}> = ({line}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const a = useEnter(0);
  const b = useEnter(12);
  const c = useEnter(24);
  const bar = interpolate(frame, [10, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const {fps} = useVideoConfig();
  const hl = spring({frame: frame - 30, fps, config: {damping: 7, stiffness: 160}});
  const k = Math.sin(Math.min(1, hl) * Math.PI);
  return (
    <AbsoluteFill>
      <div
        style={{
          ...bigBase(t, 100),
          top: 520,
          lineHeight: 1.1,
          opacity: Math.min(1, a),
          transform: `translateY(${(1 - a) * 40}px)`,
        }}
      >
        {line[0]}
        <span style={{display: 'inline-block', color: t.accent, transform: `scale(${1 + 0.15 * k})`, transformOrigin: 'left bottom'}}>{line[1]}</span>
        {line[2]}
      </div>
      <div style={{position: 'absolute', left: L, top: 1010, width: 300 * bar, height: 5, background: t.accent}} />
      <div style={{position: 'absolute', left: L, top: 1050, fontFamily: t.sans, fontWeight: 700, fontSize: 58, color: t.text, opacity: Math.min(1, b)}}>
        @souzaereis.adv
      </div>
      <div style={{position: 'absolute', left: L, top: 1135, fontFamily: t.sans, fontWeight: 500, fontSize: 36, color: t.muted, opacity: Math.min(1, b)}}>
        Souza &amp; Reis Advogados Associados
      </div>
      <div
        style={{
          position: 'absolute',
          left: L,
          top: 1310,
          width: W,
          fontFamily: t.sans,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.35,
          color: t.muted,
          opacity: Math.min(1, c),
        }}
      >
        Conteúdo informativo. Cada caso exige análise individual.
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC<{total: number}> = ({total}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: L, top: 1420, width: W, height: 6, background: `${t.muted}33`, borderRadius: 3}}>
      <div style={{width: `${(frame / total) * 100}%`, height: '100%', background: t.accent, borderRadius: 3}} />
    </div>
  );
};

export const Reel: React.FC<{def: ReelDef}> = ({def}) => {
  const total = totalFrames(def);
  let start = 0;
  return (
    <ThemeCtx.Provider value={def.theme}>
      <AbsoluteFill style={{background: def.theme.bg}}>
        <Decoration />
        <Header />
        {def.scenes.map((s, i) => {
          const from = start;
          start += s.dur;
          return (
            <Sequence key={i} from={from} durationInFrames={s.dur}>
              <SceneWrap s={s} i={i} />
            </Sequence>
          );
        })}
        <Sequence from={start} durationInFrames={def.cta.dur}>
          <Cta line={def.cta.line} />
        </Sequence>
        <Progress total={total} />
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
