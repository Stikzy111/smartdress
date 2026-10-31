import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { C } from '../theme';
import { Btn } from '../ui';
import { useBle } from '../services/ble';

export default function Home({ go, creations }) {
  const b = useBle();
  const on = b.status === 'connected';
  const tiles = [
    ['Mes créations', `${creations.length} enregistrée(s)`, 'creations'],
    ['Mes tissus', 'Stock de la machine', 'fabrics'],
    ['Mes modèles', 'Bibliothèque', 'models'],
    ['Connexion', on ? 'Machine connectée' : 'Se connecter', 'connection'],
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <View style={[s.hero, { paddingTop: (StatusBar.currentHeight || 24) + 18 }]}>
        <Text style={s.brand}>SmartDress</Text>
        <Text style={s.tag}>Concevez votre vêtement,{'\n'}la machine le prépare.</Text>
        <Pressable onPress={() => go('connection')} style={s.pill}>
          <View style={[s.dot, { backgroundColor: on ? C.ok : C.pink }]} />
          <Text style={s.pillT}>{on ? 'Connectée' : 'Non connectée'}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Btn label="Créer un vêtement" onPress={() => go('create')} style={{ paddingVertical: 20 }} />
        <View style={s.grid}>
          {tiles.map(([t, sub, to]) => (
            <Pressable key={to} onPress={() => go(to)} style={s.tile}>
              <View style={s.bar} />
              <Text style={s.tileT}>{t}</Text>
              <Text style={s.tileS}>{sub}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.foot}>Version prototype V1 - T-shirt</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.blue, paddingHorizontal: 22, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  brand: { color: C.white, fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  tag: { color: C.white, opacity: 0.92, fontSize: 15, marginTop: 6, lineHeight: 21 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, marginTop: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  pillT: { color: C.ink, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  tile: { width: '48%', backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 14 },
  bar: { width: 28, height: 4, borderRadius: 2, backgroundColor: C.pink, marginBottom: 12 },
  tileT: { fontSize: 16, fontWeight: '700', color: C.ink },
  tileS: { fontSize: 12, color: C.mute, marginTop: 4 },
  foot: { textAlign: 'center', color: C.mute, fontSize: 12, marginTop: 10 },
});
