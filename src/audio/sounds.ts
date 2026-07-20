import Sound from 'react-native-sound';

import { useSettingsStore } from '../store/settingsStore';

// Play through the ambient channel so game audio mixes with other apps and
// respects the device silent switch.
Sound.setCategory('Ambient', true);

type SoundName = 'move' | 'capture' | 'select';

// Filenames must exist in the app bundle:
//   Android -> android/app/src/main/res/raw/<name>.mp3  (lowercase, no hyphens)
//   iOS     -> added to the Xcode project bundle
const FILES: Record<SoundName, string> = {
  move: 'move.mp3',
  capture: 'capture.mp3',
  select: 'select.mp3',
};

const cache: Partial<Record<SoundName, Sound>> = {};
let loaded = false;

// Preload the clips once at app startup. If an asset is missing the clip is
// simply dropped, so playback becomes a no-op instead of crashing.
export function preloadSounds() {
  if (loaded) return;
  loaded = true;

  (Object.keys(FILES) as SoundName[]).forEach((name) => {
    const clip = new Sound(FILES[name], Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        delete cache[name];
      }
    });
    cache[name] = clip;
  });
}

export function playSound(name: SoundName) {
  if (!useSettingsStore.getState().soundEffects) return;

  const clip = cache[name];
  if (!clip) return;

  // Restart from the beginning so rapid moves each get a fresh sound.
  clip.stop(() => clip.play());
}
