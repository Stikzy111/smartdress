import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C } from '../theme';
import { Screen, Header, Btn, Card } from '../ui';
import { MODELS, MAT } from '../data/catalog';

export function Creations({ back, go, creations, removeCreation }) {
  return (
    <Screen>
      <Header title="Mes créations" onBack={back} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {creations.length === 0 && <Text style={s.empty}>Aucune création pour le moment.</Text>}
        {creations.map((c) => (
          <Card key={c.id}>
            <Text style={s.t}>{c.name} <Text style={{ color: C.mute, fontWeight: '400' }}>v{c.version}</Text></Text>
            <Text style={s.sub}>{MAT[c.config.material].label} · {c.config.options.manches} · {c.config.options.motif}</Text>
            <Text style={[s.badge, { color: c.status === 'terminée' ? C.ok : c.status === 'erreur' || c.status === 'annulée' ? C.pink : C.blue }]}>{c.status} - {new Date(c.date).toLocaleDateString('fr-FR')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Btn label="Refaire" variant="blue" onPress={() => go('production', { creation: { ...c, id: Math.random().toString(36).slice(2, 6) } })} style={s.b} />
              <Btn label="Nouvelle version" variant="ghost" onPress={() => go('create', { config: c.config, baseVersion: c.version })} style={s.b} />
            </View>
            <Text style={s.del} onPress={() => removeCreation(c.id)}>Supprimer</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function Fabrics({ back, fabrics, updateFabrics }) {
  const adj = (id, d) => updateFabrics(fabrics.map((f) => (f.id === id ? { ...f, stock: Math.max(0, +(f.stock + d).toFixed(2)) } : f)));
  return (
    <Screen>
      <Header title="Mes tissus" onBack={back} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {fabrics.map((f) => (
          <Card key={f.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[s.sw, { backgroundColor: f.hex }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.t}>{MAT[f.material].label} - {f.label}</Text>
              <Text style={s.sub}>Épaisseur {f.thickness} mm · Élasticité {f.elasticity} % · Largeur {f.width} cm</Text>
              <Text style={s.sub}>Compatible : {f.models.map((m) => MODELS[m].name).join(', ')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.t, { color: f.stock < 1 ? C.pink : C.blue }]}>{f.stock} m</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Pressable onPress={() => adj(f.id, -0.5)} style={s.pm}><Text style={s.pmT}>-</Text></Pressable>
                <Pressable onPress={() => adj(f.id, 0.5)} style={s.pm}><Text style={s.pmT}>+</Text></Pressable>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function Models({ back }) {
  return (
    <Screen>
      <Header title="Mes modèles" onBack={back} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {Object.values(MODELS).map((m) => (
          <Card key={m.id} style={!m.available && { opacity: 0.55 }}>
            <Text style={s.t}>{m.name}</Text>
            {m.available ? (<>
              <Text style={s.sub}>Tailles : {Object.keys(m.sizes).join(', ')}</Text>
              <Text style={s.sub}>Coupes : {Object.values(m.cuts).map((c) => c.label).join(', ')}</Text>
              <Text style={s.sub}>Options : {m.options.map((o) => o.label).join(', ')}</Text>
              <Text style={s.sub}>Patron : devant, dos, manches, col, poche, pastille - ordre d'assemblage inclus</Text>
            </>) : <Text style={s.sub}>Bientôt disponible</Text>}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  t: { fontSize: 16, fontWeight: '700', color: C.ink },
  sub: { color: C.mute, fontSize: 12, marginTop: 3 },
  empty: { textAlign: 'center', color: C.mute, marginTop: 40 },
  badge: { fontWeight: '700', marginTop: 6, fontSize: 13 },
  b: { flex: 1, paddingVertical: 11, marginRight: 8 },
  del: { color: C.pink, fontWeight: '600', marginTop: 12 },
  sw: { width: 34, height: 34, borderRadius: 17, marginRight: 12, borderWidth: 1, borderColor: C.line },
  pm: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  pmT: { color: C.blue, fontSize: 20, fontWeight: '700', marginTop: -2 },
});
