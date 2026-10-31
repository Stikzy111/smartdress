import React from 'react';
import Svg, { Path, Circle, Rect, Defs, ClipPath, Line, G } from 'react-native-svg';
import { MODELS, findFabric, lum } from '../data/catalog';
import { C } from '../theme';

export default function Preview({ cfg, fabrics, height = 180 }) {
  const m = MODELS[cfg.model];
  const d = m.sizes[cfg.size || 'M'];
  const cut = m.cuts[cfg.cut || 'regular'];
  const fab = findFabric(fabrics, cfg.material, cfg.color);
  const fill = fab ? fab.hex : C.blueSoft;
  const o = cfg.options;
  const k = Math.max(0.82, Math.min(1.3, (d.chest * cut.f) / 100));
  const bw = 44 * k;
  const hem = 60 + d.length * 1.3;
  const len = (o.manches === 'longues' ? 72 : 30) + Math.max(0, bw - 44) * 1.2;
  const mir = (p) => ({ x: 200 - p.x, y: p.y });
  const nL = { x: 82, y: 32 }, sL = { x: 62, y: 38 };
  const o1 = { x: sL.x - 0.82 * len, y: sL.y + 0.57 * len };
  const o2 = { x: o1.x + 0.57 * 22, y: o1.y + 0.82 * 22 };
  const A = { x: 100 - bw, y: 74 };
  const H = { x: 100 - bw, y: hem };
  const left = [sL, o1, o2, A, H];
  const right = [...left].reverse().map(mir);
  const pt = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const nR = mir(nL);
  const neck = o.col === 'v' ? `L100,66 L${pt(nL)}` : `Q100,56 ${pt(nL)}`;
  const body = `M${pt(nL)} L${left.map(pt).join(' L')} L${right.map(pt).join(' L')} L${pt(nR)} ${neck} Z`;
  const dark = lum(fill) > 0.55;
  const stripe = dark ? 'rgba(16,37,58,0.28)' : 'rgba(255,255,255,0.4)';
  const stripes = [];
  for (let y = 40; y < hem; y += 13) stripes.push(<Line key={y} x1="0" x2="200" y1={y} y2={y} stroke={stripe} strokeWidth="5" />);
  return (
    <Svg width="100%" height={height} viewBox="0 0 200 190">
      <Defs><ClipPath id="body"><Path d={body} /></ClipPath></Defs>
      <Path d={body} fill={fill} />
      {o.motif === 'rayures' && <G clipPath="url(#body)">{stripes}</G>}
      {o.motif === 'pastille' && <Circle cx="122" cy="88" r="7" fill={C.pink} />}
      {o.poche === 'oui' && <Rect x="76" y="92" width="20" height="22" fill="none" stroke={dark ? 'rgba(16,37,58,0.45)' : 'rgba(255,255,255,0.7)'} strokeWidth="1.5" />}
      <Path d={body} fill="none" stroke="rgba(16,37,58,0.4)" strokeWidth="1.5" strokeLinejoin="round" />
      <Path d={`M${pt(nL)} ${neck.replace('Z', '')} L${pt(nR)}`} fill="none" stroke="rgba(16,37,58,0.35)" strokeWidth="2" />
    </Svg>
  );
}
