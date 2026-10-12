import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Context as UserContext} from '../context/UserContext';
import TelegramConnect from '../components/TelegramConnect';
import FormButton from '../components/FormButton';
import {colors} from '../theme';

// First step after sign-up: connect the caregiver's Telegram once (free alerts),
// or continue with SMS. Then the safe-zone step.
const TelegramSetupScreen = ({navigation}) => {
  const {state, setUser, getInfoUser} = useContext(UserContext);
  useEffect(() => {
    getInfoUser(); // load the new account's phone number
  }, []);
  const [connected, setConnected] = useState(false);
  const next = () => navigation.replace('SafeZoneSetup');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Get alerts on Telegram</Text>
      <Text style={styles.subtitle}>
        Free alerts with the patient's location. The caregiver does this once; it stays connected.
      </Text>
      {connected ? (
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          <Text style={styles.doneText}>Telegram connected. Alerts will arrive there.</Text>
          <FormButton buttonTitle="Continue" onPress={next} />
        </View>
      ) : (
        <>
          <TelegramConnect
            phone={state.user.phone}
            onConnected={user => {
              setUser(user);
              setConnected(true);
            }}
          />
          <FormButton buttonTitle="Use SMS instead (₹7 per alert)" variant="secondary" onPress={next} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 32},
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text, marginTop: 8},
  subtitle: {fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16, lineHeight: 20},
  done: {alignItems: 'center', marginTop: 24},
  doneText: {fontSize: 16, color: colors.text, marginVertical: 12, textAlign: 'center'},
});

export default TelegramSetupScreen;
