import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { encode, decode } from 'base-64';

// Nordic UART Service (meme UUID cote ESP32)
const NUS = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const RX = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'; // telephone -> ESP32
const TX = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'; // ESP32 -> telephone

let state = { status: 'disconnected', demo: false, name: null };
const subs = new Set();
const lineSubs = new Set();
let manager = null, device = null, buf = '', demoState = 'READY', timers = [];

const set = (p) => { state = { ...state, ...p }; subs.forEach((f) => f(state)); };
const mgr = () => manager || (manager = new BleManager());
const emit = (l) => lineSubs.forEach((f) => f(l));

function feed(txt) {
  buf += txt;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const l = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (l) emit(l);
  }
}

async function perms() {
  if (Platform.OS !== 'android') return true;
  const P = PermissionsAndroid.PERMISSIONS;
  const list = Platform.Version >= 31 ? [P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT] : [P.ACCESS_FINE_LOCATION];
  const res = await PermissionsAndroid.requestMultiple(list);
  return list.every((p) => res[p] === 'granted');
}

// Machine simulee pour tester l'appli sans ESP32
function demoReply(line) {
  const p = line.split('|');
  const later = (ms, l) => timers.push(setTimeout(() => emit(l), ms));
  if (p[0] === 'PING') later(300, 'PONG');
  else if (p[0] === 'STATUS') later(300, 'STATE|' + demoState);
  else if (p[0] === 'CREATE') {
    demoState = 'PREPARING';
    later(500, 'ACK|' + p[1]);
    for (let i = 1; i <= 10; i++) later(1000 + i * 500, `PROGRESS|${p[1]}|${i * 10}`);
    later(6500, 'DONE|' + p[1]);
    timers.push(setTimeout(() => { demoState = 'READY'; }, 6500));
  } else if (p[0] === 'CANCEL') {
    timers.forEach(clearTimeout); timers = []; demoState = 'READY';
    later(200, 'CANCELLED|' + (p[1] || ''));
  }
}

export const ble = {
  get state() { return state; },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
  onLine(f) { lineSubs.add(f); return () => lineSubs.delete(f); },

  connectDemo() { timers.forEach(clearTimeout); timers = []; set({ status: 'connected', demo: true, name: 'SmartDress (démo)' }); },

  async scan(onFound, ms = 8000) {
    if (!(await perms())) throw new Error('Permission Bluetooth refusée.');
    set({ status: 'scanning' });
    const seen = {};
    mgr().startDeviceScan(null, null, (e, d) => {
      if (e || !d) return;
      const n = d.name || d.localName || '';
      if (/smartdress/i.test(n) && !seen[d.id]) { seen[d.id] = 1; onFound({ id: d.id, name: n }); }
    });
    await new Promise((r) => setTimeout(r, ms));
    mgr().stopDeviceScan();
    if (state.status === 'scanning') set({ status: 'disconnected' });
  },

  async connect(id, name) {
    try {
      set({ status: 'connecting' });
      mgr().stopDeviceScan();
      const d = await mgr().connectToDevice(id, { timeout: 10000 });
      await d.discoverAllServicesAndCharacteristics();
      device = d; buf = '';
      d.monitorCharacteristicForService(NUS, TX, (e, c) => { if (!e && c && c.value) feed(decode(c.value)); });
      d.onDisconnected(() => { device = null; set({ status: 'disconnected', name: null }); });
      set({ status: 'connected', demo: false, name });
    } catch (e) {
      device = null; set({ status: 'disconnected' }); throw e;
    }
  },

  async disconnect() {
    timers.forEach(clearTimeout); timers = [];
    if (device) { try { await device.cancelConnection(); } catch (e) {} device = null; }
    set({ status: 'disconnected', demo: false, name: null });
  },

  async send(line) {
    if (state.status !== 'connected') throw new Error('Non connectée');
    if (state.demo) { demoReply(line); return; }
    const data = line + '\n';
    for (let i = 0; i < data.length; i += 20) {
      await device.writeCharacteristicWithResponseForService(NUS, RX, encode(data.slice(i, i + 20)));
    }
  },
};

export function useBle() {
  const [s, setS] = useState(state);
  useEffect(() => ble.subscribe(setS), []);
  return s;
}
