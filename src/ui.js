import React from 'react';
import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native';
import { C } from './theme';

export const Header = ({ title, onBack, right }) => (
  <View style={s.header}>
    {onBack ? <Pressable onPress={onBack} hitSlop={14} style={s.back}><Text style={s.backT}>‹</Text></Pressable> : <View style={{ width: 40 }} />}
    <Text style={s.title} numberOfLines={1}>{title}</Text>
    <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
  </View>
);

export const Btn = ({ label, onPress, variant = 'pink', disabled, style }) => (
  <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [s.btn, variant === 'pink' && { backgroundColor: C.pink }, variant === 'blue' && { backgroundColor: C.blue }, variant === 'ghost' && { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.blue }, disabled && { opacity: 0.4 }, pressed && { opacity: 0.8 }, style]}>
    <Text style={[s.btnT, variant === 'ghost' && { color: C.blue }]}>{label}</Text>
  </Pressable>
);

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export const Chip = ({ label, sub, active, disabled, onPress, swatch }) => (
  <Pressable onPress={onPress} disabled={disabled} style={[s.chip, active && { borderColor: C.pink, backgroundColor: C.pinkSoft }, disabled && { opacity: 0.4 }]}>
    {swatch ? <View style={[s.sw, { backgroundColor: swatch }]} /> : null}
    <View>
      <Text style={[s.chipT, active && { color: C.pink }]}>{label}</Text>
      {sub ? <Text style={s.chipS}>{sub}</Text> : null}
    </View>
  </Pressable>
);

export const Label = ({ children }) => <Text style={s.label}>{children}</Text>;

export const Screen = ({ children }) => (
  <View style={{ flex: 1, backgroundColor: C.white, paddingTop: StatusBar.currentHeight || 24 }}>{children}</View>
);

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  backT: { fontSize: 28, color: C.blue, marginTop: -3 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: C.ink },
  btn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center' },
  btnT: { color: C.white, fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: C.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white, marginRight: 8, marginBottom: 8 },
  chipT: { fontSize: 15, fontWeight: '600', color: C.ink },
  chipS: { fontSize: 12, color: C.mute, marginTop: 2 },
  sw: { width: 22, height: 22, borderRadius: 11, marginRight: 10, borderWidth: 1, borderColor: C.line },
  label: { fontSize: 13, fontWeight: '700', color: C.blue, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 6 },
});
