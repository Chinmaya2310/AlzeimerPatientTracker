import React, {useEffect, useContext, useRef} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import MapView, {Polyline, Circle, Marker} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as UserContext} from '../context/UserContext';
import {distanceKm, formatKm, formatDateTime} from '../utils/geo';
import {colors, card} from '../theme';

const Map = () => {
  const {state: userState, getInfoUser} = useContext(UserContext);
  const {
    state: {currentLocation, locations, recording, lastAlert},
    sendLocation,
  } = useContext(LocationContext);
  const safeKm = userState.user.dist;

  useEffect(() => {
    getInfoUser();
  }, []);

  const start = locations[0];
  const dist = start && currentLocation ? distanceKm(start.coords, currentLocation.coords) : 0;
  const outside = !!(start && safeKm && dist > safeKm);

  // Alert once each time the patient leaves the safe area, not on every render
  const alertSent = useRef(false);
  useEffect(() => {
    if (!start || !currentLocation || !safeKm) {
      return;
    }
    if (outside && !alertSent.current) {
      alertSent.current = true;
      sendLocation({currentLocation, dist});
    } else if (!outside) {
      alertSent.current = false;
    }
  }, [currentLocation, locations, safeKm]);

  if (!currentLocation) {
    return <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 120}} />;
  }

  const zoneColor = outside ? colors.danger : colors.success;
  let status;
  if (!recording && !start) {
    status = {
      icon: 'information-circle',
      color: colors.primary,
      bg: colors.primarySoft,
      title: 'Ready to track',
      detail: safeKm
        ? `Safe distance is ${formatKm(safeKm)} from where the walk starts.`
        : 'Set a safe distance in Profile to get alerts.',
    };
  } else if (outside) {
    status = {
      icon: 'warning',
      color: colors.danger,
      bg: colors.dangerSoft,
      title: `Outside safe zone · ${formatKm(dist)} from start`,
      detail: lastAlert
        ? lastAlert.smsSent
          ? `Caregiver alerted by SMS at ${formatDateTime(lastAlert.createdAt)}`
          : 'Could not send the SMS alert. Check the backend.'
        : 'Alerting caregiver…',
    };
  } else {
    status = {
      icon: 'shield-checkmark',
      color: colors.success,
      bg: colors.successSoft,
      title: `Inside safe zone · ${formatKm(dist)} from start`,
      detail: safeKm ? `Alert if the patient goes beyond ${formatKm(safeKm)}.` : '',
    };
  }

  return (
    <View>
      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          initialRegion={{...currentLocation.coords, latitudeDelta: 0.02, longitudeDelta: 0.02}}
          region={{...currentLocation.coords, latitudeDelta: 0.02, longitudeDelta: 0.02}}>
          {start && safeKm ? (
            <Circle
              center={start.coords}
              radius={safeKm * 1000}
              strokeColor={zoneColor}
              strokeWidth={2}
              fillColor={outside ? 'rgba(229,72,77,0.12)' : 'rgba(47,158,102,0.12)'}
            />
          ) : null}
          {start ? (
            <Marker coordinate={start.coords} anchor={{x: 0.5, y: 0.5}} title="Start">
              <View style={[styles.dot, styles.startDot]} />
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
      <View style={[styles.status, {backgroundColor: status.bg}]}>
        <Ionicons name={status.icon} size={26} color={status.color} />
        <View style={styles.statusText}>
          <Text style={[styles.statusTitle, {color: status.color}]}>{status.title}</Text>
          {status.detail ? <Text style={styles.statusDetail}>{status.detail}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {...card, padding: 0, overflow: 'hidden'},
  map: {height: 320},
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#fff',
  },
  startDot: {backgroundColor: colors.success, width: 16, height: 16, borderRadius: 8},
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
