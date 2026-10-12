import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, {Circle, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as UserContext} from '../context/UserContext';
import {Context as AuthContext} from '../context/AuthContext';
import FormButton from '../components/FormButton';
import {formatKm} from '../utils/geo';
import {colors, card} from '../theme';

const PRESETS_KM = [0.2, 0.5, 1, 2];
const MIN_KM = 0.1;
const MAX_KM = 10;

// Map zoom that fits the whole circle
const regionFor = (center, km) => ({
  ...center,
  latitudeDelta: Math.max(0.005, (km / 111) * 2.6),
  longitudeDelta: Math.max(0.005, (km / 111) * 2.6),
});

// Used after sign-up (params.firstTime, with Skip) and from Profile / Home
const SafeZoneScreen = ({navigation, route}) => {
  const firstTime = !!(route.params && route.params.firstTime);
  const {state, getInfoUser, updateUser} = useContext(UserContext);
  const {finishSetup} = useContext(AuthContext);
  const user = state.user || {};
  const [center, setCenter] = useState(user.homeLocation || null);
  const [radiusKm, setRadiusKm] = useState(user.dist || 0.5);
  const [custom, setCustom] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const locate = () => {
    setLocating(true);
    setError('');
    Geolocation.getCurrentPosition(
      pos => {
        const c = {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
        setCenter(c);
        setLocating(false);
        mapRef.current && mapRef.current.animateToRegion(regionFor(c, radiusKm), 400);
      },
      () => {
        setLocating(false);
        setError('Could not get your location. Check that location is turned on, or tap the map to place home.');
      },
      {enableHighAccuracy: true, timeout: 15000},
    );
  };

  useEffect(() => {
    getInfoUser();
  }, []);
  // once the profile loads, use its saved zone; otherwise start from the current location
  useEffect(() => {
    if (user.homeLocation) {
      setCenter(user.homeLocation);
      setRadiusKm(user.dist || 0.5);
    } else if (!center) {
      locate();
    }
  }, [user.homeLocation, user.dist]);

  const chooseRadius = km => {
    setRadiusKm(km);
    setCustom('');
    center && mapRef.current && mapRef.current.animateToRegion(regionFor(center, km), 300);
  };

  const onCustom = txt => {
    setCustom(txt);
    const km = Number(txt);
    if (km >= MIN_KM && km <= MAX_KM) {
      setRadiusKm(km);
    }
  };

  const leave = () => {
    if (firstTime) {
      finishSetup();
      navigation.replace('Main');
    } else {
      navigation.goBack();
    }
  };

  const save = async () => {
    if (!center) {
      return setError('Set the home location first: use your current location or tap the map.');
    }
    if (custom && !(Number(custom) >= MIN_KM && Number(custom) <= MAX_KM)) {
      return setError(`Custom distance must be between ${MIN_KM} and ${MAX_KM} km.`);
    }
    setError('');
    const ok = await updateUser({userData: {...user, dist: radiusKm, homeLocation: center}});
    if (ok === false) {
      return setError('Could not save the safe zone. Is the backend running?');
    }
    leave();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {firstTime ? (
        <>
          <Text style={styles.title}>Set up your safe zone</Text>
          <Text style={styles.subtitle}>
            You'll get an alert if the patient goes outside this circle. Do this at home, or move the pin
            to the patient's home.
          </Text>
        </>
      ) : (
        <Text style={styles.subtitle}>
          You'll get an alert if the patient goes outside this circle. Drag the pin or tap the map to move home.
        </Text>
      )}

      <View style={styles.mapWrap}>
        {center ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={regionFor(center, radiusKm)}
            onPress={e => setCenter(e.nativeEvent.coordinate)}>
            <Circle
              center={center}
              radius={radiusKm * 1000}
              strokeColor={colors.success}
              strokeWidth={2}
              fillColor="rgba(47,158,102,0.15)"
            />
            <Marker
              coordinate={center}
              draggable
              onDragEnd={e => setCenter(e.nativeEvent.coordinate)}
              title="Home"
              pinColor="green"
            />
          </MapView>
        ) : (
          <View style={[styles.map, styles.placeholder]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.placeholderText}>Finding your location…</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.locate} onPress={locate} disabled={locating}>
        <Ionicons name="locate" size={18} color={colors.primary} />
        <Text style={styles.locateText}>{locating ? 'Locating…' : 'Use my current location'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Safe distance from home</Text>
      <View style={styles.chips}>
        {PRESETS_KM.map(km => {
          const active = !custom && radiusKm === km;
          return (
            <TouchableOpacity
              key={km}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => chooseRadius(km)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{formatKm(km)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        style={styles.custom}
        value={custom}
        onChangeText={onCustom}
        keyboardType="decimal-pad"
        placeholder={`Custom, in km (${MIN_KM}–${MAX_KM})`}
        placeholderTextColor="#9BA1A6"
      />
      <Text style={styles.summary}>Alert if the patient goes more than {formatKm(radiusKm)} from home.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FormButton buttonTitle="Save safe zone" onPress={save} />
      {firstTime ? (
        <FormButton buttonTitle="Skip for now" variant="secondary" onPress={leave} />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 32},
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text, marginTop: 8},
  subtitle: {fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 14, lineHeight: 20},
  mapWrap: {...card, padding: 0, overflow: 'hidden'},
  map: {height: 300},
  placeholder: {alignItems: 'center', justifyContent: 'center'},
  placeholderText: {color: colors.muted, marginTop: 8},
  locate: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 12},
  locateText: {color: colors.primary, fontWeight: 'bold', fontSize: 15, marginLeft: 6},
  label: {fontSize: 13, fontWeight: 'bold', color: colors.muted, marginTop: 4, marginBottom: 8},
  chips: {flexDirection: 'row', justifyContent: 'space-between'},
  chip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipText: {fontSize: 15, fontWeight: 'bold', color: colors.text},
  chipTextActive: {color: '#fff'},
  custom: {
    marginTop: 10,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  summary: {fontSize: 13, color: colors.muted, marginTop: 8},
  error: {color: colors.danger, marginTop: 10},
});

export default SafeZoneScreen;
