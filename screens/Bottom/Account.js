import React, {useCallback, useContext} from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as AuthContext} from '../../context/AuthContext';
import {Context as UserContext} from '../../context/UserContext';
import Avatar from '../../components/Avatar';
import FormButton from '../../components/FormButton';
import {formatKm} from '../../utils/geo';
import {colors, card} from '../../theme';

const Row = ({icon, label, value, last}) => (
  <View style={[styles.row, !last && styles.rowBorder]}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const Account = ({navigation}) => {
  const {signout} = useContext(AuthContext);
  const {
    state: {user},
    getInfoUser,
  } = useContext(UserContext);

  useFocusEffect(
    useCallback(() => {
      getInfoUser();
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={user.name} email={user.email} />
          <Text style={styles.name}>{user.name || 'Add your name'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <Text style={styles.section}>Alert settings</Text>
        <View style={styles.card}>
          <Row icon="call-outline" label="SMS alerts to" value={user.phone ? String(user.phone) : 'Not set'} />
          <Row icon="shield-checkmark-outline" label="Safe distance" value={user.dist ? formatKm(user.dist) : 'Not set'} />
          <Row icon="location-outline" label="City" value={user.city || 'Not set'} last />
        </View>

        <FormButton buttonTitle="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
        <FormButton buttonTitle="Log out" variant="secondary" onPress={signout} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  header: {alignItems: 'center', marginTop: 12, marginBottom: 20},
  name: {fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12},
  email: {fontSize: 14, color: colors.muted, marginTop: 2},
  section: {fontSize: 15, fontWeight: 'bold', color: colors.muted, marginBottom: 8},
  card: {...card, paddingVertical: 4, marginBottom: 12},
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  rowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  rowLabel: {flex: 1, fontSize: 15, color: colors.text, marginLeft: 12},
  rowValue: {fontSize: 15, fontWeight: 'bold', color: colors.text},
});

export default Account;
