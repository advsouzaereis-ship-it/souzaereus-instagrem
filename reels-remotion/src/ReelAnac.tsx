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

const NAVY = '#1F3550';
const NAVY_DARK = '#152640';
const GOLD = '#C9965A';
const BEIGE = '#EDE6DA';
const SERIF = 'Lora, serif';
const SANS = 'Inter, sans-serif';

// Área segura 1080x1920: y 230..1440, x 60..850
const SAFE_LEFT = 70;
const SAFE_WIDTH = 780;

type Scene = {
  kicker: string;
  big: string;
  bigSize?: number;
  band: string;
  support: [string, string, string]; // antes, palavra dourada, depois
  dur: number;
};

const SCENES: Scene[] = [
  {
    kicker: 'DIREITO DO PASSAGEIRO',
    big: 'Seu voo atrasou?',
    bigSize: 112,
    band: 'AS REGRAS DA ANAC MUDARAM',
    support: ['Valem desde ', '26/10/2026', '.'],
    dur: 105,
  },
  {
    kicker: 'ATRASO A PARTIR DE',
    big: '2 horas',
    band: 'ALIMENTAÇÃO',
    support: ['A companhia deve oferecer ', 'refeição', ' ou voucher.'],
    dur: 105,
  },
  {
    kicker: 'ATRASO A PARTIR DE',
    big: '4 horas',
    band: 'HOTEL E TRANSPORTE',
    support: ['Quando houver ', 'pernoite', '.'],
    dur: 105,
  },
  {
    kicker: 'RESOLUÇÃO ANAC 813/2026',
    big: 'Informação o tempo todo',
    bigSize: 104,
    band: 'PELOS CANAIS DIGITAIS',
    support: ['A companhia deve manter você ', 'informado', ' durante todo o problema.'],
    dur: 120,
  },
  {
    kicker: 'MAIS DE 4 HORAS OU CANCELAMENTO',
    big: 'Você escolhe',
    bigSize: 112,
    band: 'REACOMODAÇÃO OU REEMBOLSO',
    support: ['Reembolso ', 'integral', ' ou outro meio de transporte, conforme o caso.'],
    dur: 120,
  },
  {
    kicker: 'MALA EXTRAVIADA',
    big: '7 e 21 dias',
    bigSize: 150,
    band: 'PRAZO PARA DEVOLVER',
    support: ['7 dias em voo ', 'nacional', ', 21 dias no internacional.'],
    dur: 120,
  },
];

const CTA_DUR = 135;
export const TOTAL = SCENES.reduce((s, x) => s + x.dur, 0) + CTA_DUR;

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + drift / 10}% ${20 + drift / 20}%, #2B4766 0%, ${NAVY} 45%, ${NAVY_DARK} 100%)`,
      }}
    >
      {/* linhas finas douradas decorativas */}
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 180,
          width: 120,
          height: 4,
          background: GOLD,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -200 + drift,
          top: 520,
          width: 700,
          height: 700,
          borderRadius: '50%',
          border: `2px solid ${GOLD}`,
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -120 + drift,
          top: 600,
          width: 540,
          height: 540,
          borderRadius: '50%',
          border: `2px solid ${GOLD}`,
          opacity: 0.08,
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 240,
      left: SAFE_LEFT,
      fontFamily: SERIF,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: 6,
      color: BEIGE,
      opacity: 0.85,
    }}
  >
    SOUZA <span style={{color: GOLD}}>&amp;</span> REIS
  </div>
);

type Anim = 'punch' | 'count' | 'slide' | 'words' | 'blur' | 'drop';
const ANIMS: Anim[] = ['words', 'punch', 'count', 'blur', 'slide', 'drop'];
const BAND_STYLES = ['left', 'scaleX', 'right', 'left', 'scaleX', 'right'] as const;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const BigText: React.FC<{scene: Scene; anim: Anim}> = ({scene, anim}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = scene.bigSize ?? 170;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: SAFE_LEFT,
    top: 610,
    width: SAFE_WIDTH,
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 1.05,
    color: BEIGE,
    transformOrigin: 'left center',
  };

  if (anim === 'words') {
    const words = scene.big.split(' ');
    return (
      <div style={base}>
        {words.map((w, i) => {
          const sp = spring({frame: frame - 4 - i * 6, fps, config: {damping: 12, mass: 0.6}});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: Math.min(1, sp * 1.5),
                transform: `translateY(${(1 - sp) * 80}px) scale(${0.6 + 0.4 * sp})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    );
  }

  if (anim === 'punch') {
    // zoom de impacto: entra gigante e assenta com leve rebote
    const sp = spring({frame: frame - 4, fps, config: {damping: 9, mass: 0.7, stiffness: 140}});
    const scale = interpolate(sp, [0, 1], [2.6, 1]);
    return (
      <div style={{...base, opacity: interpolate(frame, [4, 10], [0, 1], clamp), transform: `scale(${scale})`}}>
        {scene.big}
      </div>
    );
  }

  if (anim === 'count') {
    // número sobe de 0 até o valor, depois pulso de destaque
    const m = scene.big.match(/^(\d+)(.*)$/);
    const target = m ? parseInt(m[1], 10) : 0;
    const rest = m ? m[2] : scene.big;
    const prog = interpolate(frame, [4, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    const n = Math.round(target * prog);
    const pulse = spring({frame: frame - 32, fps, config: {damping: 8, stiffness: 200}});
    const pulseScale = 1 + 0.12 * Math.sin(Math.min(1, pulse) * Math.PI);
    return (
      <div style={{...base, opacity: interpolate(frame, [2, 8], [0, 1], clamp)}}>
        <span style={{display: 'inline-block', color: GOLD, transform: `scale(${pulseScale})`, transformOrigin: 'left bottom'}}>
          {n}
        </span>
        {rest}
      </div>
    );
  }

  if (anim === 'blur') {
    const p = interpolate(frame, [4, 26], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
    return (
      <div
        style={{
          ...base,
          opacity: p,
          filter: `blur(${(1 - p) * 24}px)`,
          transform: `scale(${1.35 - 0.35 * p})`,
          letterSpacing: `${(1 - p) * 0.15}em`,
        }}
      >
        {scene.big}
      </div>
    );
  }

  if (anim === 'slide') {
    const sp = spring({frame: frame - 4, fps, config: {damping: 16}});
    return (
      <div
        style={{
          ...base,
          opacity: Math.min(1, sp * 1.4),
          transform: `translateX(${(1 - sp) * 700}px) skewX(${(1 - sp) * -12}deg)`,
        }}
      >
        {scene.big}
      </div>
    );
  }

  // drop: cai do alto com leve giro
  const sp = spring({frame: frame - 4, fps, config: {damping: 10, mass: 0.9}});
  return (
    <div
      style={{
        ...base,
        opacity: Math.min(1, sp * 2),
        transform: `translateY(${(1 - sp) * -260}px) rotate(${(1 - sp) * -8}deg)`,
      }}
    >
      {scene.big}
    </div>
  );
};

const SceneView: React.FC<{scene: Scene; index: number}> = ({scene, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const anim = ANIMS[index % ANIMS.length];
  const bandStyle = BAND_STYLES[index % BAND_STYLES.length];

  const kickerIn = spring({frame, fps, config: {damping: 200}});
  const bandIn = spring({frame: frame - 18, fps, config: {damping: 15}});
  const supportIn = spring({frame: frame - 28, fps, config: {damping: 200}});

  // câmera: aproximação lenta durante toda a cena
  const push = interpolate(frame, [0, scene.dur], [1, 1.07], clamp);
  // saída alternada: zoom atravessando ou deslize para a esquerda
  const outP = interpolate(frame, [scene.dur - 12, scene.dur], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const zoomOut = index % 2 === 0;
  const outTransform = zoomOut
    ? `scale(${1 + outP * 0.5})`
    : `translateX(${-outP * 400}px)`;

  // zoom de destaque na palavra dourada
  const hl = spring({frame: frame - 48, fps, config: {damping: 7, stiffness: 180}});
  const hlScale = 1 + 0.22 * Math.sin(Math.min(1, hl) * Math.PI);
  const hlGlow = Math.sin(Math.min(1, hl) * Math.PI);

  // faixa dourada: três estilos de entrada + leve respiração
  const breathe = 1 + 0.015 * Math.sin((frame - 30) / 8) * (frame > 30 ? 1 : 0);
  const bandTransform =
    bandStyle === 'left'
      ? `translateX(${(bandIn - 1) * 110}%)`
      : bandStyle === 'right'
      ? `translateX(${(1 - bandIn) * 110}%)`
      : 'none';
  const bandClip =
    bandStyle === 'scaleX'
      ? `inset(0 ${Math.max(0, (1 - bandIn) * 100)}% 0 0)`
      : 'none';

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - outP,
        transform: `${outTransform} scale(${push})`,
        transformOrigin: '40% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          bottom: 1920 - 580,
          width: SAFE_WIDTH,
          lineHeight: 1.25,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: interpolate(kickerIn, [0, 1], [14, 4]),
          color: GOLD,
          opacity: kickerIn,
        }}
      >
        {scene.kicker}
      </div>

      <BigText scene={scene} anim={anim} />

      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT - 10,
          bottom: 1920 - 1250,
          width: SAFE_WIDTH + 20,
          overflow: 'hidden',
          transform: `scale(${breathe})`,
          transformOrigin: 'left center',
        }}
      >
        <div
          style={{
            background: GOLD,
            padding: '26px 30px',
            transform: bandTransform,
            clipPath: bandClip,
            transformOrigin: 'left center',
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 54,
            lineHeight: 1.1,
            color: NAVY,
            letterSpacing: 1,
          }}
        >
          {scene.band}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 1285,
          width: SAFE_WIDTH,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.3,
          color: '#FFFFFF',
          opacity: supportIn,
          transform: `translateY(${(1 - supportIn) * 20}px)`,
        }}
      >
        {scene.support[0]}
        <span
          style={{
            display: 'inline-block',
            color: GOLD,
            transform: `scale(${hlScale})`,
            transformOrigin: 'center bottom',
            textShadow: `0 0 ${18 * hlGlow}px rgba(201,150,90,${0.7 * hlGlow})`,
          }}
        >
          {scene.support[1]}
        </span>
        {scene.support[2]}
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 200}});
  const b = spring({frame: frame - 12, fps, config: {damping: 200}});
  const c = spring({frame: frame - 24, fps, config: {damping: 200}});
  const line = interpolate(frame, [10, 40], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 520,
          width: SAFE_WIDTH,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.08,
          color: BEIGE,
          opacity: a,
          transform: `translateY(${(1 - a) * 40}px)`,
        }}
      >
        Salve e envie para quem vai <span style={{color: GOLD}}>viajar</span>.
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 1010,
          width: 300 * line,
          height: 5,
          background: GOLD,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 1050,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 58,
          color: '#FFFFFF',
          opacity: b,
        }}
      >
        @souzaereis.adv
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 1135,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 36,
          color: BEIGE,
          opacity: b * 0.85,
        }}
      >
        Souza &amp; Reis Advogados Associados
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE_LEFT,
          top: 1310,
          width: SAFE_WIDTH,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.35,
          color: BEIGE,
          opacity: c * 0.75,
        }}
      >
        Conteúdo informativo. Cada caso exige análise individual.
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const p = frame / TOTAL;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_LEFT,
        top: 1420,
        width: SAFE_WIDTH,
        height: 6,
        background: 'rgba(237,230,218,0.15)',
        borderRadius: 3,
      }}
    >
      <div
        style={{
          width: `${p * 100}%`,
          height: '100%',
          background: GOLD,
          borderRadius: 3,
        }}
      />
    </div>
  );
};

export const ReelAnac: React.FC = () => {
  let start = 0;
  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <Background />
      <Header />
      {SCENES.map((s, i) => {
        const from = start;
        start += s.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={s.dur}>
            <SceneView scene={s} index={i} />
          </Sequence>
        );
      })}
      <Sequence from={start} durationInFrames={CTA_DUR}>
        <Cta />
      </Sequence>
      <Progress />
    </AbsoluteFill>
  );
};
