/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import useLocation from '../../hooks/useLocation';
import {Context as LocationContext} from '../../context/LocationContext';
import Maps from '../../components/Map';
import TrackForm from '../../components/TrackForm';
import {colors} from '../../theme';

const Record = () => {
  const {state, addLocation} = useContext(LocationContext);
  const isFocused = useIsFocused();
  // while recording, the background service supplies locations; this only previews the map
  const callback = useCallback(location => addLocation(location, false), []);
  const [err] = useLocation(isFocused && !state.recording, callback);
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Track a walk</Text>
        <Text style={styles.subtitle}>
          The caregiver gets one alert each time the patient leaves the safe zone.
        </Text>
        <Maps />
        {err ? <Text style={styles.error}>Please enable location services</Text> : null}
        <TrackForm />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text},
  subtitle: {fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16},
  error: {color: colors.danger, marginTop: 8},
});

export default Record;
