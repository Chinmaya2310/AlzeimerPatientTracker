import React, {useCallback, useContext} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as TrackContext} from '../../context/TrackContext';
import {summarizeTrack} from '../../utils/track';
import {formatKm, formatDateTime} from '../../utils/geo';
import {colors, card} from '../../theme';

const History = ({navigation}) => {
  const {state, fetchTracks} = useContext(TrackContext);
  useFocusEffect(
    useCallback(() => {
      fetchTracks();
    }, []),
  );

  const walks = [...state].reverse(); // newest first

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={walks}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Past walks</Text>
            <Text style={styles.subtitle}>Every saved walk with its route on the map.</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.card}>
            <Text style={styles.empty}>
              No walks saved yet. Track a walk and tap “Save walk” to see it here.
            </Text>
          </View>
        }
        renderItem={({item}) => {
          const s = summarizeTrack(item);
          return (
            <TouchableOpacity
              style={[styles.card, styles.row]}
              onPress={() => navigation.navigate('TrackDetails', {_id: item._id})}>
              <View style={styles.icon}>
                <Ionicons name="walk" size={22} color={colors.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.name}>{item.name || 'Untitled walk'}</Text>
                <Text style={styles.meta}>
                  {s.date ? formatDateTime(s.date) : 'No date'} · {formatKm(s.lengthKm)}
                  {s.minutes != null ? ` · ${s.minutes} min` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text},
  subtitle: {fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16},
  card: {...card, marginBottom: 12},
  row: {flexDirection: 'row', alignItems: 'center'},
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {fontSize: 16, fontWeight: 'bold', color: colors.text},
  meta: {fontSize: 13, color: colors.muted, marginTop: 3},
  empty: {fontSize: 14, color: colors.muted, lineHeight: 20},
});

export default History;
