import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { C } from '../theme';
import { Screen, Header, Btn, Card, Label } from '../ui';
import { ble, useBle } from '../services/ble';

export default function Connection({ back }) {
  const b = useBle();
  const [found, setFound] = useState([]);
  const [err, setErr] = useState('');
  const [log, setLog] = useState('');
  const on = b.status === 'connected';

  useEffect(() => ble.onLine((l) => setLog(l)), []);

  const scan = async () => {
    setErr(''); setFound([]);
    try { await ble.scan((d) => setFound((f) => [...f, d])); } catch (e) { setErr(e.message); }
  };
  const connect = async (d) => { setErr(''); try { await ble.connect(d.id, d.name); } catch (e) { setErr('Connexion impossible. Réessayez.'); } };
  const send = (l) => { setLog('...'); ble.send(l).catch(() => setLog('Erreur d\'envoi')); };

  return (
    <Screen>
      <Header title="Connexion" onBack={back} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card style={{ alignItems: 'center' }}>
          <View style={[s.dot, { backgroundColor: on ? C.ok : C.pink }]} />
          <Text style={s.state}>{on ? 'Connectée' : b.status === 'scanning' ? 'Recherche...' : b.status === 'connecting' ? 'Connexion...' : 'Non connectée'}</Text>
          {on && <Text style={s.sub}>{b.name}</Text>}
        </Card>
        {err ? <Text style={s.err}>{err}</Text> : null}
        {!on ? (<>
          <Btn label={b.status === 'scanning' ? 'Recherche en cours...' : 'Rechercher SmartDress'} variant="blue" disabled={b.status === 'scanning' || b.status === 'connecting'} onPress={scan} />
          {found.map((d) => <Card key={d.id} style={{ marginTop: 12 }}><Text style={s.name}>{d.name}</Text><Btn label="Se connecter" onPress={() => connect(d)} style={{ marginTop: 8, paddingVertical: 11 }} /></Card>)}
          {b.status !== 'scanning' && found.length === 0 && <Text style={s.hint}>Allumez la machine, activez le Bluetooth du téléphone, puis lancez la recherche. L'appareil doit s'appeler « SmartDress ».</Text>}
          <Label>Test sans machine</Label>
          <Btn label="Activer le mode démo" variant="ghost" onPress={() => ble.connectDemo()} />
          <Text style={s.hint}>Le mode démo simule la machine pour tester tout le parcours.</Text>
        </>) : (<>
          <Label>Tests</Label>
          <View style={{ flexDirection: 'row' }}>
            <Btn label="PING" variant="blue" onPress={() => send('PING')} style={{ flex: 1, marginRight: 8 }} />
            <Btn label="STATUS" variant="blue" onPress={() => send('STATUS')} style={{ flex: 1 }} />
          </View>
          <Card style={{ marginTop: 12 }}><Text style={s.sub}>Dernière réponse</Text><Text style={s.mono}>{log || '-'}</Text></Card>
          <Btn label="Déconnecter" variant="ghost" onPress={() => ble.disconnect()} style={{ marginTop: 6 }} />
        </>)}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  dot: { width: 18, height: 18, borderRadius: 9, marginBottom: 8 },
  state: { fontSize: 20, fontWeight: '800', color: C.ink },
  sub: { color: C.mute, fontSize: 12, marginTop: 4 },
  name: { fontWeight: '700', color: C.ink, fontSize: 16 },
  err: { color: C.pink, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  hint: { color: C.mute, fontSize: 12, marginTop: 10, lineHeight: 17 },
  mono: { fontFamily: 'monospace', color: C.blue, fontSize: 15, marginTop: 4 },
});
