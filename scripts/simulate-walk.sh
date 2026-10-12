#!/bin/bash
# Simulate the patient walking north on the Android emulator (fake GPS).
# Usage: scripts/simulate-walk.sh [km to walk, default 1.2] [seconds per 50 m step, default 2]
ADB=${ADB:-adb}
KM=${1:-1.2}; DELAY=${2:-2}
LAT0=20.2961; LON0=85.8245
STEPS=$(python3 -c "print(int($KM/0.05))")
for i in $(seq 0 $STEPS); do
  LAT=$(python3 -c "print(f'{$LAT0 + $i*0.00045:.6f}')")
  $ADB emu geo fix $LON0 $LAT >/dev/null
  python3 -c "print(f'{$i*0.05:.2f} km from start')"
  sleep $DELAY
done
