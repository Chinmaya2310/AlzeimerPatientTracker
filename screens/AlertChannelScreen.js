import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import trackerApi from '../apis/tracker';
import {Context as UserContext} from '../context/UserContext';
import FormButton from '../components/FormButton';
import {colors, card} from '../theme';

const errorText = err =>
  (err.response && err.response.data && (err.response.data.error || err.response.data.message)) ||
  'Something went wrong. Is the backend running?';

const Option = ({selected, icon, title, detail, badge, onPress}) => (
  <TouchableOpacity style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
    <Ionicons name={icon} size={26} color={selected ? colors.primary : colors.muted} />
    <View style={styles.optionText}>
      <View style={styles.row}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={[styles.badge, badge === 'Free' ? styles.free : styles.paid]}>{badge}</Text>
      </View>
      <Text style={styles.optionDetail}>{detail}</Text>
    </View>
    <Ionicons
      name={selected ? 'radio-button-on' : 'radio-button-off'}
      size={22}
      color={selected ? colors.primary : colors.muted}
    />
  </TouchableOpacity>
);

// Choose how alerts reach the caregiver: SMS (paid) or Telegram (free)
const AlertChannelScreen = () => {
  const {state, getInfoUser, setUser} = useContext(UserContext);
  const user = state.user || {};
  const [step, setStep] = useState(null); // null | 'start' | 'phone'
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {text, ok}

  useFocusEffect(
    useCallback(() => {
      getInfoUser();
    }, []),
  );

  const run = async fn => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setMessage({text: errorText(err), ok: false});
    }
    setBusy(false);
  };

  const verified = !!(user.telegramChatId && user.telegramPhone);

  const choose = channel =>
    run(async () => {
      if (channel === 'telegram' && !verified) {
        return connectTelegram();
      }
      const res = await trackerApi.put('/alert-channel', {channel});
      setUser(res.data);
    });

  const connectTelegram = async () => {
    const res = await trackerApi.post('/telegram/link');
    setStep('start');
    await Linking.openURL(res.data.url);
  };

  // The bot handles Start and the shared number; the app just follows along
  const checkProgress = async () => {
    try {
      const res = await trackerApi.post('/telegram/verify');
      if (res.data.step === 'connected') {
        setUser(res.data.user);
        setStep(null);
        setMessage({text: 'Telegram connected. Alerts will arrive there for free.', ok: true});
      } else {
        setStep(res.data.step);
      }
    } catch (err) {
      setStep(null);
      setMessage({text: errorText(err), ok: false});
    }
  };

  // while connecting: check every few seconds and whenever the app comes back to the front
  useEffect(() => {
    if (!step) {
      return;
    }
    const timer = setInterval(checkProgress, 3000);
    const onAppState = state => state === 'active' && checkProgress();
    AppState.addEventListener('change', onAppState); // RN 0.64: remove with removeEventListener
    return () => {
      clearInterval(timer);
      AppState.removeEventListener('change', onAppState);
    };
  }, [step]);

  const disconnect = () =>
    run(async () => {
      const res = await trackerApi.delete('/telegram');
      setUser(res.data);
    });

  const sendTest = () =>
    run(async () => {
      const res = await trackerApi.post('/alerts/test');
      setMessage({
        text: res.data.channel === 'telegram' ? 'Test sent to Telegram.' : 'Test SMS sent.',
        ok: true,
      });
    });

  const channel = user.alertChannel || 'sms';
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Choose how the caregiver is alerted when the patient leaves the safe zone.</Text>

      <Option
        selected={channel === 'telegram'}
        icon="paper-plane"
        title="Telegram"
        badge="Free"
        detail={
          verified
            ? `Connected${user.telegramName ? ` as ${user.telegramName}` : ''} (${user.telegramPhone}). Message plus a map pin.`
            : user.telegramChatId
            ? 'Reconnect needed: confirm your Telegram uses the registered phone number.'
            : `Message plus a map pin. Connect the Telegram account for ${user.phone || 'your phone number'}.`
        }
        onPress={() => choose('telegram')}
      />
      <Option
        selected={channel === 'sms'}
        icon="chatbubble-ellipses"
        title="SMS"
        badge="Paid"
        detail={`Text message to ${user.phone || 'your phone'} with a Google Maps link. Costs about ₹7 per alert.`}
        onPress={() => choose('sms')}
      />

      {step ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {step === 'start' ? 'Step 1 of 2: tap Start in Telegram' : 'Step 2 of 2: share your number'}
          </Text>
          <Text style={styles.cardText}>
            {step === 'start'
              ? 'Telegram opened the SafeWalk bot. Tap Start there.'
              : `In Telegram, tap the “Share my phone number” button (don't type it). It must be ${user.phone}.`}
          </Text>
          <Text style={styles.waiting}>Waiting for Telegram… this updates by itself.</Text>
          <FormButton buttonTitle="Open Telegram again" variant="secondary" onPress={() => run(connectTelegram)} />
        </View>
      ) : null}

      {message ? (
        <Text style={[styles.message, {color: message.ok ? colors.success : colors.danger}]}>{message.text}</Text>
      ) : null}

      <FormButton
        buttonTitle={channel === 'sms' ? 'Send test SMS (costs ₹7)' : 'Send test alert'}
        variant="secondary"
        onPress={sendTest}
        disabled={busy}
      />
      {user.telegramChatId && !verified && !step ? (
        <FormButton buttonTitle="Reconnect Telegram" onPress={() => run(connectTelegram)} />
      ) : null}
      {user.telegramChatId ? (
        <TouchableOpacity style={styles.link} onPress={disconnect}>
          <Text style={styles.linkText}>Disconnect Telegram</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20, paddingBottom: 32},
  subtitle: {fontSize: 14, color: colors.muted, marginBottom: 16, lineHeight: 20},
  option: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {borderColor: colors.primary},
  optionText: {flex: 1, marginHorizontal: 12},
  row: {flexDirection: 'row', alignItems: 'center'},
  optionTitle: {fontSize: 17, fontWeight: 'bold', color: colors.text},
  badge: {fontSize: 12, fontWeight: 'bold', marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8},
  free: {color: colors.success, backgroundColor: colors.successSoft},
  paid: {color: colors.muted, backgroundColor: colors.border},
  optionDetail: {fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18},
  card: {...card, marginBottom: 12},
  cardTitle: {fontSize: 16, fontWeight: 'bold', color: colors.text},
  cardText: {fontSize: 14, color: colors.muted, marginTop: 4},
  waiting: {fontSize: 13, color: colors.primary, marginTop: 8},
  message: {marginTop: 4, marginBottom: 4, fontSize: 14},
  link: {alignItems: 'center', marginTop: 16},
  linkText: {color: colors.danger, fontWeight: 'bold', fontSize: 15},
});

export default AlertChannelScreen;
