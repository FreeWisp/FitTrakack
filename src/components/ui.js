// Componenti UI di base riutilizzati in tutte le schermate.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

// Contenitore standard di schermata. Con scroll=false va usato per le liste
// (FlatList), che gestiscono lo scorrimento da sole.
export function Screen({ children, scroll = true, style }) {
  if (!scroll) return <View style={[styles.screen, style]}>{children}</View>;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, onPress, style }) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Chip({ label, active, onPress, color = colors.accent, icon, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color + '26', borderColor: color },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={13}
          color={active ? color : colors.muted}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text style={[styles.chipText, active && { color, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color = colors.accent, icon }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      {icon ? <Ionicons name={icon} size={12} color={color} style={{ marginRight: 3 }} /> : null}
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.accent, height = 8, style }) {
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }, style]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function StatTile({ icon, label, value, color = colors.accent, style }) {
  return (
    <View style={[styles.statTile, style]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, message }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={42} color={colors.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
}

export function FAB({ icon = 'add', label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={icon} size={22} color="#fff" />
      {label ? <Text style={styles.fabLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, color = colors.muted, size = 20, style }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.iconButton, style]}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function Button({ label, onPress, icon, variant = 'primary', style }) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const textColor = isPrimary ? '#fff' : isDanger ? colors.danger : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary && { backgroundColor: colors.accent, borderColor: colors.accent },
        isDanger && { borderColor: colors.danger + '66' },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={17} color={textColor} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: spacing.l, paddingBottom: 120 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  sectionTitleText: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sectionAction: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  chipText: { color: colors.muted, fontSize: 13 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginRight: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  progressTrack: { backgroundColor: colors.border, overflow: 'hidden', flexGrow: 0 },
  statTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    gap: 4,
  },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 12 },
  emptyMessage: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    elevation: 6,
  },
  fabLabel: { color: '#fff', fontWeight: '700', marginLeft: 6, fontSize: 14 },
  iconButton: { padding: 6 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.accent + '66',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
