import React, {useCallback, useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import trackerApi from '../../apis/tracker';
import {Context as UserContext} from '../../context/UserContext';
import {Context as TrackContext} from '../../context/TrackContext';
import {Context as LocationContext} from '../../context/LocationContext';
import FormButton from '../../components/FormButton';
import {formatKm, formatDateTime} from '../../utils/geo';
import {colors, card} from '../../theme';

const Stat = ({icon, value, label}) => (
  <View style={styles.stat}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Home = ({navigation}) => {
  const {state: userState, getInfoUser} = useContext(UserContext);
  const {state: tracks, fetchTracks} = useContext(TrackContext);
  const {state: locState} = useContext(LocationContext);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const user = userState.user || {};

  const load = useCallback(async () => {
    getInfoUser();
    fetchTracks();
    try {
      const res = await trackerApi.get('/alerts');
      setAlerts(res.data);
    } catch (e) {
      setAlerts([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={styles.hello}>Hello, {user.name || 'Caregiver'}</Text>
        <Text style={styles.subtitle}>Keep your loved one safe on every walk.</Text>

        {!user.homeLocation ? (
          <View style={[styles.card, styles.setupCard]}>
            <View style={styles.row}>
              <Ionicons name="home" size={20} color={colors.primary} />
              <Text style={[styles.statusTitle, {marginLeft: 8}]}>Set your safe zone</Text>
            </View>
            <Text style={styles.statusDetail}>
              Choose the patient's home and how far they can safely go. Tracking starts after this.
            </Text>
            <FormButton buttonTitle="Set safe zone" onPress={() => navigation.navigate('SafeZone')} />
          </View>
        ) : null}

        <View style={[styles.card, styles.statusCard]}>
          <View style={styles.row}>
            <View
              style={[styles.dot, {backgroundColor: locState.recording ? colors.success : '#B0B4BA'}]}
            />
            <Text style={styles.statusTitle}>
              {locState.recording ? 'Tracking a walk now' : 'Not tracking'}
            </Text>
          </View>
          <Text style={styles.statusDetail}>
            {locState.recording
              ? 'Live location is being recorded. Open the map to see the safe zone.'
              : 'Start tracking when the patient goes out for a walk.'}
          </Text>
          <FormButton
            buttonTitle={locState.recording ? 'Open live map' : 'Start a walk'}
            onPress={() => navigation.navigate(user.homeLocation ? 'Track' : 'SafeZone')}
          />
        </View>

        <View style={styles.stats}>
          <Stat
            icon="shield-checkmark-outline"
            value={user.homeLocation && user.dist ? formatKm(user.dist) : 'Not set'}
            label="Safe zone"
          />
          <Stat icon="walk-outline" value={tracks.length} label="Walks saved" />
          <Stat icon="notifications-outline" value={alerts.length} label="Alerts sent" />
        </View>

        <Text style={styles.section}>Recent alerts</Text>
        {alerts.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>
              No alerts yet. When the patient leaves the safe zone, the alert appears here and an SMS
              goes to {user.phone ? user.phone : 'the caregiver'}.
            </Text>
          </View>
        ) : (
          alerts.slice(0, 5).map(a => (
            <TouchableOpacity
              key={a._id}
              style={[styles.card, styles.alert]}
              onPress={() =>
                Linking.openURL(`https://www.google.com/maps/place/${a.latitude},${a.longitude}`)
              }>
              <View style={styles.alertIcon}>
                <Ionicons name="warning" size={20} color={colors.danger} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.alertTitle}>
                  Left safe zone{a.distanceKm ? ` · ${formatKm(a.distanceKm)} from home` : ''}
                </Text>
                <Text style={styles.alertDetail}>
                  {formatDateTime(a.createdAt)} · {a.smsSent ? 'SMS sent' : 'SMS failed'}
                </Text>
              </View>
              <Ionicons name="map-outline" size={20} color={colors.muted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 32},
  hello: {fontSize: 26, fontWeight: 'bold', color: colors.text},
  subtitle: {fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16},
  card: {...card, marginBottom: 12},
  statusCard: {paddingBottom: 18},
  setupCard: {paddingBottom: 18, borderWidth: 1, borderColor: colors.primary},
  row: {flexDirection: 'row', alignItems: 'center'},
  dot: {width: 10, height: 10, borderRadius: 5, marginRight: 8},
  statusTitle: {fontSize: 17, fontWeight: 'bold', color: colors.text},
  statusDetail: {fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: 4},
  stats: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  stat: {...card, flex: 1, marginHorizontal: 4, alignItems: 'center', paddingVertical: 14},
  statValue: {fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 6},
  statLabel: {fontSize: 12, color: colors.muted, marginTop: 2, textAlign: 'center'},
  section: {fontSize: 17, fontWeight: 'bold', color: colors.text, marginTop: 12, marginBottom: 10},
  empty: {fontSize: 14, color: colors.muted, lineHeight: 20},
  alert: {flexDirection: 'row', alignItems: 'center'},
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTitle: {fontSize: 15, fontWeight: 'bold', color: colors.text},
  alertDetail: {fontSize: 13, color: colors.muted, marginTop: 2},
});

export default Home;
