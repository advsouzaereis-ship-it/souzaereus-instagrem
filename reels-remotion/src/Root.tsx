import React from 'react';
import {Composition} from 'remotion';
import {ReelAnac, TOTAL} from './ReelAnac';
import {Reel, totalFrames} from './engine';
import {VEICULO, DANO_MORAL, ARREPENDIMENTO} from './reels';

const Veiculo: React.FC = () => <Reel def={VEICULO} />;
const DanoMoral: React.FC = () => <Reel def={DANO_MORAL} />;
const Arrependimento: React.FC = () => <Reel def={ARREPENDIMENTO} />;

const common = {fps: 30, width: 1080, height: 1920} as const;

export const Root: React.FC = () => (
  <>
    <Composition id="ReelAnac" component={ReelAnac} durationInFrames={TOTAL} {...common} />
    <Composition id="Veiculo" component={Veiculo} durationInFrames={totalFrames(VEICULO)} {...common} />
    <Composition id="DanoMoral" component={DanoMoral} durationInFrames={totalFrames(DANO_MORAL)} {...common} />
    <Composition id="Arrependimento" component={Arrependimento} durationInFrames={totalFrames(ARREPENDIMENTO)} {...common} />
  </>
);
