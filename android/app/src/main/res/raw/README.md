# Sound assets

Drop the game sound clips here for `react-native-sound` to load them:

- `move.mp3` — plays on a normal move
- `capture.mp3` — plays when a piece is captured
- `select.mp3` — plays when a piece is selected (tap)

Rules for Android `res/raw`:
- lowercase filenames only, no hyphens or spaces (letters, digits, `_`)
- short clips (a few hundred ms) work best

After adding files, rebuild the Android app (`npm run android`).
Until the files exist, sound playback is a safe no-op.
