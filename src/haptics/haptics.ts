import { Platform, Vibration } from 'react-native';

// Built-in Vibration API only, so this works without a native rebuild.
// iOS ignores custom durations/patterns and always fires the same fixed
// system buzz, so we only vary intensity on Android.
function vibrate(androidMs: number) {
  if (Platform.OS === 'android') {
    Vibration.vibrate(androidMs);
  } else {
    Vibration.vibrate();
  }
}

export function hapticTap() {
  vibrate(10);
}

export function hapticMove() {
  vibrate(15);
}

export function hapticCapture() {
  vibrate(25);
}

export function hapticCheck() {
  vibrate(40);
}

export function hapticGameEnd() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 30, 60, 30]);
  } else {
    Vibration.vibrate();
  }
}
