import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { C } from '../theme';
import { Screen, Header, Btn, Card } from '../ui';
import { ble } from '../services/ble';
import { MODELS, MAT, findFabric } from '../data/catalog';
import { generateJob } from '../services/engine';

export default function Production({ back, reset, go, fabrics, updateFabrics, upsertCreation, params }) {
  const cr = params.creation;
  const cfg = cr.config;
  const [phase, setPhase] = useState('start');
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState('');
  const ph = useRef('start');
  const done = useRef(false);
  const timer = useRef(null);
  const job = useMemo(() => generateJob(cfg, fabrics), []);
  const fab = findFabric(fabrics, cfg.material, cfg.color);
  const line = `CREATE|${cr.id}|${MODELS[cfg.model].code}|${cfg.size}|${fab.code}|${MAT[cfg.material].code}`;
  const P = (p) => { ph.current = p; setPhase(p); };
  const finish = (status) => upsertCreation({ ...cr, status, date: Date.now() });

  const start = async () => {
    setPct(0); setMsg('');
    if (ble.state.status !== 'connected') { setMsg("SmartDress n'est pas connectée."); P('error'); return; }
    P('sending');
    try { await ble.send(line); } catch (e) { setMsg("Échec de l'envoi Bluetooth."); P('error'); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (ph.current === 'sending') { setMsg('La machine ne répond pas.'); P('error'); } }, 8000);
  };

  useEffect(() => {
    const off = ble.onLine((l) => {
      const p = l.split('|');
      if (p[0] === 'ACK' && p[1] === cr.id) { clearTimeout(timer.current); P('running'); }
      else if (p[0] === 'PROGRESS' && p[1] === cr.id) { P('running'); setPct(+p[2] || 0); }
      else if (p[0] === 'DONE' && p[1] === cr.id) {
        setPct(100); P('done');
        if (!done.current) {
          done.current = true;
          updateFabrics(fabrics.map((f) => (f.id === job.fabric.id ? { ...f, stock: Math.max(0, +(f.stock - job.fabric.needM).toFixed(2)) } : f)));
          finish('terminée');
        }
      } else if (p[0] === 'ERROR') { setMsg(`La machine a signalé une erreur (${p[2] || 'inconnue'}).`); P('error'); finish('erreur'); }
      else if (p[0] === 'CANCELLED') { P('cancelled'); finish('annulée'); }
    });
    start();
    return () => { off(); clearTimeout(timer.current); };
  }, []);

  const cancel = () => ble.send(`CANCEL|${cr.id}`).catch(() => {});
  const T = {
    sending: ['Envoi à SmartDress...', 'Transmission de la commande par Bluetooth.'],
    running: ['Création en cours...', 'SmartDress prépare votre vêtement.'],
    done: ['Préparation terminée !', 'Le tissu est prêt.'],
    error: ['Une erreur est survenue', msg],
    cancelled: ['Création annulée', 'Aucun tissu n\'a été consommé.'],
    start: ['Préparation...', ''],
  }[phase];
  const col = phase === 'done' ? C.ok : phase === 'error' || phase === 'cancelled' ? C.pink : C.blue;

  return (
    <Screen>
      <Header title="Fabrication" />
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={[s.circle, { borderColor: col }]}><Text style={[s.pct, { color: col }]}>{phase === 'error' || phase === 'cancelled' ? '!' : `${pct}%`}</Text></View>
        <Text style={s.title}>{T[0]}</Text>
        <Text style={s.sub}>{T[1]}</Text>
        <View style={s.bar}><View style={[s.barIn, { width: `${pct}%`, backgroundColor: col }]} /></View>
        <Card style={{ width: '100%', marginTop: 24 }}>
          <Text style={s.k}>Commande {cr.id}</Text>
          <Text style={s.v}>{cr.name}</Text>
          <Text style={s.k}>Envoyé à la machine (V1)</Text>
          <Text style={s.mono}>{line}</Text>
          <Text style={[s.k, { marginTop: 10 }]}>La V1 exécute uniquement l'action physique du prototype (déplacement du tissu).</Text>
        </Card>
        <View style={{ width: '100%' }}>
          {(phase === 'sending' || phase === 'running') && <Btn label="Annuler" variant="ghost" onPress={cancel} />}
          {phase === 'error' && <><Btn label="Réessayer" onPress={start} style={{ marginBottom: 10 }} /><Btn label="Connexion" variant="ghost" onPress={() => go('connection')} /></>}
          {(phase === 'done' || phase === 'cancelled') && <Btn label="Retour à l'accueil" variant="blue" onPress={reset} />}
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  circle: { width: 150, height: 150, borderRadius: 75, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  pct: { fontSize: 36, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 22, textAlign: 'center' },
  sub: { color: C.mute, marginTop: 6, textAlign: 'center' },
  bar: { width: '100%', height: 8, borderRadius: 4, backgroundColor: C.line, marginTop: 20 },
  barIn: { height: 8, borderRadius: 4 },
  k: { color: C.mute, fontSize: 12, marginTop: 4 },
  v: { color: C.ink, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  mono: { fontFamily: 'monospace', color: C.blue, fontSize: 13, marginTop: 2 },
});
