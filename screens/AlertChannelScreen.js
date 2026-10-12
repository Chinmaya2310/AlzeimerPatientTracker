import React, {useCallback, useContext, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import trackerApi from '../apis/tracker';
import {Context as UserContext} from '../context/UserContext';
import TelegramConnect from '../components/TelegramConnect';
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

// Profile > Alerts via: choose SMS (paid) or Telegram (free, connected once per account)
const AlertChannelScreen = () => {
  const {state, getInfoUser, setUser} = useContext(UserContext);
  const user = state.user || {};
  const [connecting, setConnecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {text, ok}

  useFocusEffect(
    useCallback(() => {
      getInfoUser();
    }, []),
  );

  const connected = !!(user.telegramChatId && user.telegramPhone);

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

  const choose = channel =>
    run(async () => {
      if (channel === 'telegram' && !connected) {
        return setConnecting(true);
      }
      setConnecting(false);
      const res = await trackerApi.put('/alert-channel', {channel});
      setUser(res.data);
    });

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
        selected={channel === 'telegram' || connecting}
        icon="paper-plane"
        title="Telegram"
        badge="Free"
        detail={
          connected
            ? `Connected${user.telegramName ? ` as ${user.telegramName}` : ''} (${user.telegramPhone}). Message plus a map pin.`
            : 'Message plus a map pin. Connect once by scanning a QR code with the caregiver’s phone.'
        }
        onPress={() => choose('telegram')}
      />
      <Option
        selected={channel === 'sms' && !connecting}
        icon="chatbubble-ellipses"
        title="SMS"
        badge="Paid"
        detail={`Text message to ${user.phone || 'your phone'} with a Google Maps link. Costs about ₹7 per alert.`}
        onPress={() => choose('sms')}
      />

      {connecting ? (
        <TelegramConnect
          phone={user.phone}
          onConnected={u => {
            setUser(u);
            setConnecting(false);
            setMessage({text: 'Telegram connected. Alerts will arrive there for free.', ok: true});
          }}
        />
      ) : null}

      {message ? (
        <Text style={[styles.message, {color: message.ok ? colors.success : colors.danger}]}>{message.text}</Text>
      ) : null}

      {!connecting ? (
        <FormButton
          buttonTitle={channel === 'sms' ? 'Send test SMS (costs ₹7)' : 'Send test alert'}
          variant="secondary"
          onPress={sendTest}
          disabled={busy}
        />
      ) : null}
      {connected ? (
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
  message: {marginTop: 4, marginBottom: 4, fontSize: 14},
  link: {alignItems: 'center', marginTop: 16},
  linkText: {color: colors.danger, fontWeight: 'bold', fontSize: 15},
});

export default AlertChannelScreen;
