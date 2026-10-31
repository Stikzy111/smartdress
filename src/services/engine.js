import { MODELS, SEAM, findFabric, conflict } from '../data/catalog';

const r = (x) => Math.round(x * 2) / 2;

// 1. Patron numerique parametrique
export function buildPattern(cfg) {
  const m = MODELS[cfg.model];
  const d = m.sizes[cfg.size];
  const f = m.cuts[cfg.cut].f;
  const o = cfg.options;
  const sl = o.manches === 'longues' ? 58 : 20;
  const body = { w: r((d.chest * f) / 4 + 2 * SEAM + 2), h: r(d.length + SEAM + 2) };
  const pieces = [
    { id: 'front', name: 'Devant', qty: 1, ...body, marks: ['repère épaule', 'repère emmanchure', 'centre'] },
    { id: 'back', name: 'Dos', qty: 1, ...body, marks: ['repère épaule', 'repère emmanchure', 'centre'] },
    { id: 'sleeve', name: 'Manche', qty: 2, w: r(d.chest * 0.2 + 2 * SEAM), h: r(sl + SEAM + 2), marks: ['repère épaule'] },
    { id: 'collar', name: 'Col', qty: 1, w: r(42 + 2 * SEAM + (o.col === 'v' ? 4 : 0)), h: 6, marks: ['centre dos'] },
  ];
  if (o.poche === 'oui') pieces.push({ id: 'pocket', name: 'Poche', qty: 1, w: 12, h: 14, marks: ['angle haut'] });
  if (o.motif === 'pastille') pieces.push({ id: 'patch', name: 'Pastille', qty: 1, w: 8, h: 8, marks: ['centre'] });
  const assembly = [];
  if (o.poche === 'oui') assembly.push('Coudre la poche sur le devant');
  if (o.motif === 'pastille') assembly.push('Appliquer la pastille sur le devant');
  assembly.push('Assembler les épaules devant / dos', "Monter les manches (repères d'emmanchure)", 'Fermer les côtés et dessous de manches', 'Monter le col', 'Faire les ourlets (bas et manches)');
  return { pieces, assembly };
}

// 2. Optimisation de decoupe (placement par rangees)
export function layout(pieces, width) {
  const items = [];
  pieces.forEach((p) => { for (let i = 0; i < p.qty; i++) items.push({ id: p.id, label: p.qty > 1 ? `${p.name} ${i + 1}` : p.name, w: p.w, h: p.h }); });
  items.sort((a, b) => b.h - a.h);
  let x = 0, y = 0, rowH = 0;
  const placements = [];
  for (const it of items) {
    if (x + it.w > width) { y += rowH + 1; x = 0; rowH = 0; }
    placements.push({ ...it, x, y });
    x += it.w + 1;
    rowH = Math.max(rowH, it.h);
  }
  const length = Math.ceil(y + rowH + 5);
  const used = items.reduce((s, i) => s + i.w * i.h, 0);
  return { placements, length, waste: Math.round((1 - used / (width * length)) * 100) };
}

// 3. Donnees techniques pour la machine
export function generateJob(cfg, fabrics) {
  const fab = findFabric(fabrics, cfg.material, cfg.color);
  if (!fab || !cfg.size || !cfg.cut) return null;
  const { pieces, assembly } = buildPattern(cfg);
  const lay = layout(pieces, fab.width);
  return {
    model: MODELS[cfg.model].code, size: cfg.size, cut: cfg.cut, options: cfg.options,
    pieces, assembly, layout: lay, cutOrder: lay.placements.map((p) => p.label),
    fabric: { id: fab.id, code: fab.code, needM: +(lay.length / 100).toFixed(2) },
  };
}

// 4. Verification avant fabrication
export function validate(cfg, fabrics, job) {
  const e = [];
  const m = MODELS[cfg.model];
  if (!m || !m.available) e.push("Ce modèle n'est pas encore disponible.");
  if (!m || !m.sizes[cfg.size]) e.push('Taille invalide.');
  if (!m || !m.cuts[cfg.cut]) e.push('Coupe non choisie.');
  const fab = findFabric(fabrics, cfg.material, cfg.color);
  if (!fab) e.push('Tissu ou couleur non choisi.');
  else {
    if (!fab.models.includes(cfg.model)) e.push('Tissu incompatible avec ce modèle.');
    if (job && fab.stock < job.fabric.needM) e.push(`Tissu insuffisant : ${job.fabric.needM} m nécessaires, ${fab.stock} m disponibles.`);
  }
  const c = conflict(cfg);
  if (c) e.push(c);
  if (job) {
    if (!job.pieces.length || job.assembly.length < 4) e.push('Patron incomplet.');
    if (fab && Math.max(...job.pieces.map((p) => p.w)) > fab.width) e.push('Une pièce dépasse la largeur du tissu.');
  }
  return e;
}
