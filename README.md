# Alzheimer's Patient Tracker (React Native app)

Tracks a patient's location and sends the caregiver an SMS with a live Google Maps link when the patient walks outside a safe radius.

Backend: [AlzeimerBackend](https://github.com/Chinmaya2310/AlzeimerBackend) (Node.js, Express, MongoDB).

Originally built in 2021 as a team project with [Abhinav Anand](https://github.com/abhinavanand500). Revived and fixed in 2026 so it builds and runs end to end again.

## Features
- Sign up / sign in (JWT), login persists across app restarts
- Record a walk: live GPS track drawn on Google Maps, saved per user
- Safe-area alert: when the distance from the start point exceeds the caregiver's safe distance, the backend sends **one** SMS per exit (re-arms when the patient comes back inside)
- Saved tracks list with route view; profile with editable safe distance

## Run it (Android emulator)
Requirements: Node 20, Java 11 (Gradle 6.7), Android SDK with an emulator, the backend running on port 3001.

```bash
npm install --legacy-peer-deps
NODE_OPTIONS=--openssl-legacy-provider npx react-native start   # Metro on Node 20
cd android && ./gradlew assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
```
The app calls the backend at `http://10.0.2.2:3001` (the host machine as seen from the emulator); change `apis/tracker.js` for a real device.

## Simulate a walk
Sign in, set a safe distance (Account → Edit), start recording on the Record tab, then:
```bash
scripts/simulate-walk.sh 1.2      # walks 1.2 km north in 50 m steps
```
or use the emulator's Extended controls → Location → Routes.

## 2026 fixes
- Alert sent on every re-render (SMS spam) → once per safe-area exit, using the caregiver's saved distance
- Track details / Edit Profile unreachable after login, logout not working → logged-in navigator + login restored once at startup
- Buttons needing two taps while the keyboard is open; Edit Profile inputs refilling old values; sign-up ignoring "Confirm Password"
- Build: Fresco pinned to 2.3.0 (2.2.0 only existed on the shut-down JCenter), unused location libraries removed from autolinking
