import React, { useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { C } from './src/theme';
import { loadAll, saveCreations, saveFabrics } from './src/services/storage';
import Home from './src/screens/Home';
import Create from './src/screens/Create';
import Production from './src/screens/Production';
import Connection from './src/screens/Connection';
import { Creations, Fabrics, Models } from './src/screens/Library';

const SCREENS = { home: Home, create: Create, production: Production, creations: Creations, fabrics: Fabrics, models: Models, connection: Connection };

export default function App() {
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
  const [fabrics, setFabrics] = useState(null);
  const [creations, setCreations] = useState([]);

  useEffect(() => { loadAll().then((d) => { setFabrics(d.fabrics); setCreations(d.creations); }); }, []);
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { setStack((s) => s.slice(0, -1)); return true; }
      return false;
    });
    return () => h.remove();
  }, [stack.length]);

  if (!fabrics) return null;

  const go = (name, params = {}) => setStack((s) => [...s, { name, params }]);
  const replace = (name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params }]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const reset = () => setStack([{ name: 'home', params: {} }]);
  const updateFabrics = (f) => { setFabrics(f); saveFabrics(f); };
  const upsertCreation = (c) => setCreations((prev) => {
    const n = prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    saveCreations(n); return n;
  });
  const removeCreation = (id) => setCreations((prev) => { const n = prev.filter((x) => x.id !== id); saveCreations(n); return n; });

  const cur = stack[stack.length - 1];
  const S = SCREENS[cur.name];
  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <S key={stack.length} params={cur.params} {...{ go, replace, back, reset, fabrics, updateFabrics, creations, upsertCreation, removeCreation }} />
    </View>
  );
}
