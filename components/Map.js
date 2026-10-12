import React, {useEffect, useContext} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MapView, {Polyline, Circle, Marker} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as UserContext} from '../context/UserContext';
import {distanceKm, formatKm, formatDateTime} from '../utils/geo';
import {colors, card} from '../theme';

const Map = () => {
  const navigation = useNavigation();
  const {state: userState, getInfoUser} = useContext(UserContext);
  const {
    state: {currentLocation, locations, recording, lastAlert, trackingError},
  } = useContext(LocationContext);
  const safeKm = userState.user.dist;
  const home = userState.user.homeLocation;

  useEffect(() => {
    getInfoUser();
  }, []);

  const dist = home && currentLocation ? distanceKm(home, currentLocation.coords) : 0;
  const outside = !!(home && safeKm && dist > safeKm);

  // Alerts are decided by the backend for each tracked point (services/geofence.js there)

  if (!currentLocation) {
    return (
      <View style={styles.waiting}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.waitingText}>
          Finding your location… If this takes long, check that location is on, or step outside or near a window.
        </Text>
      </View>
    );
  }

  const zoneColor = outside ? colors.danger : colors.success;
  const zoom = Math.max(0.02, ((safeKm || 0.5) / 111) * 3);
  let status;
  if (!home) {
    status = {
      icon: 'home',
      color: colors.primary,
      bg: colors.primarySoft,
      title: 'Set your safe zone first',
      detail: 'Choose the home location and safe distance so alerts can be sent.',
      action: true,
    };
  } else if (outside) {
    status = {
      icon: 'warning',
      color: colors.danger,
      bg: colors.dangerSoft,
      title: `Outside safe zone · ${formatKm(dist)} from home`,
      detail: !recording
        ? 'Start tracking to alert the caregiver.'
        : lastAlert
        ? lastAlert.sent
          ? `Caregiver alerted by ${lastAlert.channel === 'telegram' ? 'Telegram' : 'SMS'} at ${formatDateTime(lastAlert.createdAt)}`
          : 'Could not send the alert. Check the alert settings in Profile.'
        : 'Checking… the caregiver is alerted after two readings outside.',
    };
  } else {
    status = {
      icon: 'shield-checkmark',
      color: colors.success,
      bg: colors.successSoft,
      title: `Inside safe zone · ${formatKm(dist)} from home`,
      detail: `Alert if the patient goes beyond ${formatKm(safeKm)}.`,
    };
  }

  return (
    <View>
      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          initialRegion={{...currentLocation.coords, latitudeDelta: zoom, longitudeDelta: zoom}}
          region={{...currentLocation.coords, latitudeDelta: zoom, longitudeDelta: zoom}}>
          {home && safeKm ? (
            <Circle
              center={home}
              radius={safeKm * 1000}
              strokeColor={zoneColor}
              strokeWidth={2}
              fillColor={outside ? 'rgba(229,72,77,0.12)' : 'rgba(47,158,102,0.12)'}
            />
          ) : null}
          {home ? (
            <Marker coordinate={home} anchor={{x: 0.5, y: 0.5}} title="Home">
              <View style={styles.homeDot}>
                <Ionicons name="home" size={12} color="#fff" />
              </View>
            </Marker>
          ) : null}
          <Polyline
            coordinates={locations.map(loc => loc.coords)}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
          <Marker coordinate={currentLocation.coords} anchor={{x: 0.5, y: 0.5}} title="Patient">
            <View style={styles.dot} />
          </Marker>
        </MapView>
      </View>
      <TouchableOpacity
        activeOpacity={status.action ? 0.7 : 1}
        disabled={!status.action}
        onPress={() => navigation.navigate('SafeZone')}
        style={[styles.status, {backgroundColor: status.bg}]}>
        <Ionicons name={status.icon} size={26} color={status.color} />
        <View style={styles.statusText}>
          <Text style={[styles.statusTitle, {color: status.color}]}>{status.title}</Text>
          {status.detail ? <Text style={styles.statusDetail}>{status.detail}</Text> : null}
          {trackingError ? (
            <Text style={[styles.statusDetail, {color: colors.danger}]}>{trackingError}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {...card, padding: 0, overflow: 'hidden'},
  waiting: {...card, alignItems: 'center', paddingVertical: 40},
  waitingText: {color: colors.muted, textAlign: 'center', marginTop: 12, lineHeight: 20},
  map: {height: 320},
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#fff',
  },
  homeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  statusText: {marginLeft: 12, flex: 1},
  statusTitle: {fontSize: 15, fontWeight: 'bold'},
  statusDetail: {fontSize: 13, color: colors.muted, marginTop: 2},
});

export default Map;
