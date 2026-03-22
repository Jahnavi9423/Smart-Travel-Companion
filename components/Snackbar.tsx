import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';
import Colors from '@/constants/colors';

type SnackbarOptions = {
  message: string;
  actionLabel?: string;
  duration?: number;
  onAction?: () => void;
};

const SnackbarContext = createContext<{ show: (opts: SnackbarOptions) => void } | null>(null);

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SnackbarOptions | null>(null);
  const visible = !!state;
  const anim = useRef(new Animated.Value(0)).current;
  const timeout = useRef<number | null>(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(() => setState(null));
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, [anim]);

  const show = useCallback((opts: SnackbarOptions) => {
    setState(opts);
    Animated.timing(anim, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => hide(), opts.duration ?? 3500) as unknown as number;
  }, [anim, hide]);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      {state ? (
        <Animated.View style={[styles.container, { transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [80, 0] }) }] }] } pointerEvents="box-none">
          <View style={styles.card}>
            <Text style={styles.message}>{state.message}</Text>
            {state.actionLabel ? (
              <TouchableOpacity onPress={() => { state.onAction?.(); hide(); }} style={styles.action}>
                <Text style={styles.actionText}>{state.actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
};

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  message: { color: Colors.text, flex: 1 },
  action: { marginLeft: 12 },
  actionText: { color: Colors.primary, fontWeight: '700' as const },
});
