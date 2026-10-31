import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_FABRICS } from '../data/catalog';

export async function loadAll() {
  try {
    const [f, c] = await Promise.all([AsyncStorage.getItem('sd_fabrics'), AsyncStorage.getItem('sd_creations')]);
    return { fabrics: f ? JSON.parse(f) : DEFAULT_FABRICS, creations: c ? JSON.parse(c) : [] };
  } catch (e) {
    return { fabrics: DEFAULT_FABRICS, creations: [] };
  }
}
export const saveFabrics = (v) => AsyncStorage.setItem('sd_fabrics', JSON.stringify(v)).catch(() => {});
export const saveCreations = (v) => AsyncStorage.setItem('sd_creations', JSON.stringify(v)).catch(() => {});
