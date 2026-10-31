export const SEAM = 1; // marge de couture en cm

export const MAT = {
  coton: { label: 'Coton', code: 'COTTON' },
  jean: { label: 'Jean', code: 'DENIM' },
  extensible: { label: 'Tissu extensible', code: 'STRETCH' },
};

const COL = {
  blanc: ['Blanc', '#FFFFFF', 'WHITE'],
  noir: ['Noir', '#1B1B1F', 'BLACK'],
  gris: ['Gris', '#9AA3AB', 'GREY'],
  bleu: ['Bleu ciel', '#0593C6', 'BLUE'],
  rose: ['Rose vif', '#D83995', 'PINK'],
  denim: ['Bleu denim', '#3D5A80', 'BLUE'],
};

const f = (material, color, stock, thickness, elasticity) => ({
  id: material + '-' + color, material, color,
  label: COL[color][0], hex: COL[color][1], code: COL[color][2],
  stock, thickness, elasticity, width: 150, models: ['tshirt'],
});

// stock en metres lineaires (rouleau de 150 cm de large)
export const DEFAULT_FABRICS = [
  f('coton', 'blanc', 6, 0.4, 5), f('coton', 'noir', 6, 0.4, 5),
  f('coton', 'gris', 4, 0.4, 5), f('coton', 'bleu', 4, 0.4, 5),
  f('coton', 'rose', 3, 0.4, 5),
  f('jean', 'denim', 5, 1.0, 2), f('jean', 'noir', 3, 1.0, 2),
  f('extensible', 'noir', 4, 0.5, 35), f('extensible', 'blanc', 4, 0.5, 35),
  f('extensible', 'gris', 3, 0.5, 35),
];

export const MODELS = {
  tshirt: {
    id: 'tshirt', name: 'T-shirt', code: 'TSHIRT', available: true,
    sizes: { S: { chest: 92, length: 66 }, M: { chest: 98, length: 69 }, L: { chest: 104, length: 72 }, XL: { chest: 110, length: 75 } },
    cuts: {
      ajustee: { label: 'Ajustée', f: 0.96 },
      regular: { label: 'Droite', f: 1.05 },
      oversize: { label: 'Oversize', f: 1.25 },
    },
    options: [
      { key: 'col', label: 'Col', values: [['rond', 'Rond'], ['v', 'Col V']] },
      { key: 'manches', label: 'Manches', values: [['courtes', 'Courtes'], ['longues', 'Longues']] },
      { key: 'poche', label: 'Poche poitrine', values: [['non', 'Sans'], ['oui', 'Avec']] },
      { key: 'motif', label: 'Motif', values: [['uni', 'Uni'], ['rayures', 'Rayures'], ['pastille', 'Pastille rose']] },
    ],
  },
  sweat: { id: 'sweat', name: 'Sweat', available: false },
  pantalon: { id: 'pantalon', name: 'Pantalon', available: false },
};

// Regles de compatibilite : ajouter une ligne suffit
export const RULES = [
  { test: (c) => c.options.motif === 'rayures' && c.material === 'jean', msg: 'Les rayures ne sont pas réalisables sur du jean.' },
  { test: (c) => c.options.poche === 'oui' && c.material === 'extensible', msg: 'La poche se déforme sur un tissu extensible.' },
  { test: (c) => c.options.manches === 'longues' && c.cut === 'ajustee' && c.material === 'jean', msg: 'Manches longues ajustées impossibles en jean (trop rigide).' },
];

export const conflict = (c) => { const r = RULES.find((x) => x.test(c)); return r ? r.msg : null; };
export const findFabric = (fabrics, material, color) => fabrics.find((x) => x.material === material && x.color === color);
export const materialsFor = (fabrics, model) => Object.keys(MAT).filter((k) => fabrics.some((x) => x.material === k && x.models.includes(model)));
export const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
export const newId = () => Math.random().toString(36).slice(2, 6);
