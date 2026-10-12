import React, {useContext, useLayoutEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import MapView, {Polyline, Marker} from 'react-native-maps';
import {Context as TrackContext} from '../context/TrackContext';
import {summarizeTrack} from '../utils/track';
import {formatKm, formatDateTime} from '../utils/geo';
import {colors, card} from '../theme';

const Stat = ({value, label}) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TrackDetails = ({route, navigation}) => {
  const {state} = useContext(TrackContext);
  const track = state.find(t => t._id === route.params._id);

  useLayoutEffect(() => {
    navigation.setOptions({title: track ? track.name || 'Walk' : 'Walk'});
  }, [navigation, track]);

  if (!track || !track.locations.length) {
    return <Text style={styles.empty}>This walk has no recorded points.</Text>;
  }

  const s = summarizeTrack(track);
  const coords = track.locations.map(l => l.coords);
  const lats = coords.map(c => c.latitude);
  const lons = coords.map(c => c.longitude);
  const region = {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
    latitudeDelta: Math.max(0.005, (Math.max(...lats) - Math.min(...lats)) * 1.6),
    longitudeDelta: Math.max(0.005, (Math.max(...lons) - Math.min(...lons)) * 1.6),
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{s.date ? formatDateTime(s.date) : ''}</Text>
      <View style={styles.stats}>
        <Stat value={formatKm(s.lengthKm)} label="Walked" />
        <Stat value={formatKm(s.farthestKm)} label="Farthest from start" />
        <Stat value={s.minutes != null ? `${s.minutes} min` : '—'} label="Duration" />
      </View>
      <View style={styles.mapWrap}>
        <MapView style={styles.map} initialRegion={region}>
          <Polyline coordinates={coords} strokeColor={colors.primary} strokeWidth={4} />
          <Marker coordinate={coords[0]} title="Start" pinColor="green" />
          <Marker coordinate={coords[coords.length - 1]} title="End" pinColor="red" />
        </MapView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  date: {fontSize: 14, color: colors.muted, marginBottom: 12},
  stats: {flexDirection: 'row', marginBottom: 12},
  stat: {...card, flex: 1, marginHorizontal: 4, alignItems: 'center', paddingVertical: 14},
  statValue: {fontSize: 17, fontWeight: 'bold', color: colors.text},
  statLabel: {fontSize: 12, color: colors.muted, marginTop: 2, textAlign: 'center'},
  mapWrap: {...card, padding: 0, overflow: 'hidden'},
  map: {height: 420},
  empty: {padding: 20, color: colors.muted},
});

export default TrackDetails;
