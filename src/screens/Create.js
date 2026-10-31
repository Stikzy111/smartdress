import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { C } from '../theme';
import { Screen, Header, Btn, Card, Chip, Label } from '../ui';
import Preview from '../components/Preview';
import { MODELS, MAT, conflict, findFabric, materialsFor, newId } from '../data/catalog';
import { generateJob, validate } from '../services/engine';

const STEPS = ['Vêtement', 'Taille', 'Coupe', 'Tissu', 'Couleur', 'Options', 'Récapitulatif'];

export default function Create({ back, replace, fabrics, upsertCreation, params }) {
  const [cfg, setCfg] = useState(params.config || { model: 'tshirt', size: null, cut: null, material: null, color: null, options: { col: 'rond', manches: 'courtes', poche: 'non', motif: 'uni' } });
  const [step, setStep] = useState(params.config ? 6 : 0);
  const m = MODELS[cfg.model];
  const set = (p) => setCfg((c) => ({ ...c, ...p }));
  const ok = [true, !!cfg.size, !!cfg.cut, !!cfg.material, !!cfg.color, true, true][step];
  const job = useMemo(() => (step === 6 ? generateJob(cfg, fabrics) : null), [step, cfg, fabrics]);
  const errors = step === 6 ? validate(cfg, fabrics, job) : [];
  const fab = findFabric(fabrics, cfg.material, cfg.color);

  const makeCreation = (status) => {
    const c = { id: newId(), name: `${m.name} ${cfg.size} ${fab ? fab.label : ''}`, config: cfg, version: (params.baseVersion || 0) + 1, status, date: Date.now() };
    upsertCreation(c);
    return c;
  };

  const body = () => {
    if (step === 0) return (<>
      <Label>Choisir un vêtement</Label>
      {Object.values(MODELS).map((x) => <Chip key={x.id} label={x.name} sub={x.available ? 'Disponible' : 'Bientôt disponible'} active={cfg.model === x.id} disabled={!x.available} onPress={() => set({ model: x.id })} />)}
    </>);
    if (step === 1) return (<>
      <Label>Taille</Label>
      <View style={s.row}>{Object.entries(m.sizes).map(([k, v]) => <Chip key={k} label={k} sub={`Poitrine ${v.chest} cm`} active={cfg.size === k} onPress={() => set({ size: k })} />)}</View>
      <Text style={s.note}>Les mesures personnalisées arrivent dans une prochaine version.</Text>
    </>);
    if (step === 2) return (<>
      <Label>Coupe</Label>
      <View style={s.row}>{Object.entries(m.cuts).map(([k, v]) => <Chip key={k} label={v.label} active={cfg.cut === k} onPress={() => set({ cut: k })} />)}</View>
    </>);
    if (step === 3) return (<>
      <Label>Tissu</Label>
      <View style={s.row}>{materialsFor(fabrics, cfg.model).map((k) => {
        const msg = conflict({ ...cfg, material: k });
        return <Chip key={k} label={MAT[k].label} sub={msg || undefined} active={cfg.material === k} disabled={!!msg} onPress={() => set({ material: k, color: null })} />;
      })}</View>
    </>);
    if (step === 4) return (<>
      <Label>Couleur</Label>
      <View style={s.row}>{fabrics.filter((f) => f.material === cfg.material && f.models.includes(cfg.model)).map((f) => (
        <Chip key={f.id} label={f.label} sub={f.stock > 0 ? `${f.stock} m en stock` : 'Épuisé'} swatch={f.hex} active={cfg.color === f.color} disabled={f.stock <= 0} onPress={() => set({ color: f.color })} />
      ))}</View>
    </>);
    if (step === 5) return (<>
      {m.options.map((g) => (
        <View key={g.key}>
          <Label>{g.label}</Label>
          <View style={s.row}>{g.values.map(([v, l]) => {
            const msg = conflict({ ...cfg, options: { ...cfg.options, [g.key]: v } });
            return <Chip key={v} label={l} sub={msg || undefined} active={cfg.options[g.key] === v} disabled={!!msg} onPress={() => set({ options: { ...cfg.options, [g.key]: v } })} />;
          })}</View>
        </View>
      ))}
    </>);
    const rows = [
      ['Vêtement', m.name, 0], ['Taille', cfg.size, 1], ['Coupe', m.cuts[cfg.cut].label, 2],
      ['Tissu', MAT[cfg.material].label, 3], ['Couleur', fab ? fab.label : '-', 4],
      ...m.options.map((g) => [g.label, g.values.find((v) => v[0] === cfg.options[g.key])[1], 5]),
    ];
    return (<>
      <Card>{rows.map(([k, v, st], i) => (
        <View key={i} style={s.rec}><Text style={s.recK}>{k}</Text><Text style={s.recV}>{v}</Text><Text style={s.edit} onPress={() => setStep(st)}>Modifier</Text></View>
      ))}</Card>
      {errors.length > 0 && <Card style={{ backgroundColor: C.pinkSoft, borderColor: C.pink }}>{errors.map((e, i) => <Text key={i} style={{ color: C.pink, fontWeight: '600', marginBottom: 4 }}>{e}</Text>)}</Card>}
      {job && <Card>
        <Label>Données techniques</Label>
        <Text style={s.tech}>Tissu nécessaire : {job.fabric.needM} m (chute estimée {job.layout.waste} %)</Text>
        <Text style={s.tech}>Pièces : {job.pieces.map((p) => `${p.qty}x ${p.name} ${p.w}x${p.h} cm`).join(' · ')}</Text>
        <Text style={s.tech}>Ordre de découpe : {job.cutOrder.join(', ')}</Text>
        <Text style={[s.tech, { marginTop: 6, fontWeight: '700' }]}>Assemblage</Text>
        {job.assembly.map((a, i) => <Text key={i} style={s.tech}>{i + 1}. {a}</Text>)}
      </Card>}
    </>);
  };

  return (
    <Screen>
      <Header title={STEPS[step]} onBack={step === 0 ? back : () => setStep(step - 1)} right={<Text style={{ color: C.mute }}>{step + 1}/7</Text>} />
      <View style={s.prog}><View style={[s.progIn, { width: `${((step + 1) / 7) * 100}%` }]} /></View>
      <View style={s.prev}><Preview cfg={cfg} fabrics={fabrics} /></View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>{body()}</ScrollView>
      <View style={s.foot}>
        {step < 6 ? <Btn label="Suivant" disabled={!ok} onPress={() => setStep(step + 1)} style={{ flex: 1 }} /> : (<>
          <Btn label="Enregistrer" variant="ghost" onPress={() => { makeCreation('brouillon'); back(); }} style={{ flex: 1, marginRight: 10 }} />
          <Btn label="Créer" disabled={errors.length > 0} onPress={() => { const c = makeCreation('en attente'); replace('production', { creation: c }); }} style={{ flex: 1 }} />
        </>)}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  prog: { height: 4, backgroundColor: C.line, marginHorizontal: 20, borderRadius: 2 },
  progIn: { height: 4, backgroundColor: C.pink, borderRadius: 2 },
  prev: { backgroundColor: C.blueSoft, marginHorizontal: 20, marginTop: 12, borderRadius: 18, paddingVertical: 6 },
  foot: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: C.line },
  note: { color: C.mute, fontSize: 12, marginTop: 8 },
  rec: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  recK: { width: 100, color: C.mute },
  recV: { flex: 1, fontWeight: '600', color: C.ink },
  edit: { color: C.blue, fontWeight: '600' },
  tech: { color: C.ink, fontSize: 13, lineHeight: 19 },
});
