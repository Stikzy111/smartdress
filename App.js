import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, StatusBar, View } from 'react-native';
import { useFonts } from 'expo-font';
import { C } from './src/theme';
import { NavCtx } from './src/nav';
import { loadAll, saveCreations, saveFabrics, saveUploads } from './src/services/storage';
import { newCfg, newId } from './src/data/catalog';
import { useBle } from './src/services/ble';
import Menu from './src/components/Menu';
import Splash from './src/screens/Splash';
import Home from './src/screens/Home';
import Create from './src/screens/Create';
import Editor from './src/screens/Editor';
import Production from './src/screens/Production';
import Connection from './src/screens/Connection';
import { Atelier, Project, Company, Support } from './src/screens/Pages';
import { Creations, Fabrics, Models } from './src/screens/Library';

// Seules les graisses utilisees sont embarquees (APK plus leger)
const FONTS = {
  PlayfairDisplay_400Regular: require('@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf'),
  PlayfairDisplay_400Regular_Italic: require('@expo-google-fonts/playfair-display/400Regular_Italic/PlayfairDisplay_400Regular_Italic.ttf'),
  PlayfairDisplay_600SemiBold: require('@expo-google-fonts/playfair-display/600SemiBold/PlayfairDisplay_600SemiBold.ttf'),
  PlayfairDisplay_700Bold: require('@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf'),
  Jost_400Regular: require('@expo-google-fonts/jost/400Regular/Jost_400Regular.ttf'),
  Jost_500Medium: require('@expo-google-fonts/jost/500Medium/Jost_500Medium.ttf'),
  Jost_600SemiBold: require('@expo-google-fonts/jost/600SemiBold/Jost_600SemiBold.ttf'),
};

const SCREENS = { home: Home, atelier: Atelier, create: Create, editor: Editor, production: Production, creations: Creations, fabrics: Fabrics, models: Models, connection: Connection, project: Project, company: Company, support: Support };

function Page({ children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return <Animated.View style={{ flex: 1, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>{children}</Animated.View>;
}

export default function App() {
  const [fontsOk] = useFonts(FONTS);
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
  const [menu, setMenu] = useState(false);
  const [data, setData] = useState(null);
  const [minDelay, setMinDelay] = useState(false);
  const [fabrics, setFabrics] = useState([]);
  const [creations, setCreations] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [draft, setDraft] = useState({ cfg: newCfg('tshirt'), step: 0, baseVersion: 0 });
  const ble = useBle();

  useEffect(() => { loadAll().then((d) => { setFabrics(d.fabrics); setCreations(d.creations); setUploads(d.uploads); setData(true); }); const t = setTimeout(() => setMinDelay(true), 2400); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menu) { setMenu(false); return true; }
      if (stack.length > 1) { setStack((s) => s.slice(0, -1)); return true; }
      return false;
    });
    return () => h.remove();
  }, [stack.length, menu]);

  if (!fontsOk || !data || !minDelay) return <Splash />;

  const go = (name, params = {}) => setStack((s) => [...s, { name, params }]);
  const replace = (name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params }]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const reset = () => setStack([{ name: 'home', params: {} }]);
  const navigate = (name) => { setMenu(false); setStack(name === 'home' ? [{ name: 'home', params: {} }] : [{ name: 'home', params: {} }, { name, params: {} }]); };
  const startDraft = (config, baseVersion = 0, model = 'tshirt') => {
    setDraft(config ? { cfg: { layers: [], ...config }, step: 7, baseVersion } : { cfg: newCfg(model), step: 0, baseVersion: 0 });
    go('create');
  };
  const updateFabrics = (f) => { setFabrics(f); saveFabrics(f); };
  const upsertCreation = (c) => setCreations((prev) => { const n = prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev]; saveCreations(n); return n; });
  const removeCreation = (id) => setCreations((prev) => { const n = prev.filter((x) => x.id !== id); saveCreations(n); return n; });
  const addUpload = (uri, name) => { const u = { id: newId() + Date.now().toString(36), uri, name }; setUploads((p) => { const n = [u, ...p]; saveUploads(n); return n; }); return u; };
  const removeUpload = (id) => setUploads((p) => { const n = p.filter((x) => x.id !== id); saveUploads(n); return n; });

  const cur = stack[stack.length - 1];
  const S = SCREENS[cur.name];
  return (
    <NavCtx.Provider value={{ openMenu: () => setMenu(true) }}>
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <StatusBar barStyle={['project', 'production'].includes(cur.name) ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <Page key={stack.length + cur.name}>
          <S params={cur.params} {...{ go, replace, back, reset, fabrics, updateFabrics, creations, upsertCreation, removeCreation, uploads, addUpload, removeUpload, draft, setDraft, startDraft }} />
        </Page>
        <Menu open={menu} onClose={() => setMenu(false)} onNavigate={navigate} connected={ble.status === 'connected'} />
      </View>
    </NavCtx.Provider>
  );
}
