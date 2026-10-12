import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Linking, Share, AppState, ActivityIndicator} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import trackerApi from '../apis/tracker';
import FormButton from './FormButton';
import {colors, card} from '../theme';

const errorText = err =>
  (err.response && err.response.data && err.response.data.error) ||
  'Could not reach the server. Is the backend running?';

// Connects the caregiver's Telegram once per account. The caregiver scans the QR code
// with their own phone (the app usually runs on the patient's phone), taps Start and
// "Share my phone number" in the bot; this component notices and calls onConnected.
const TelegramConnect = ({phone, onConnected}) => {
  const [url, setUrl] = useState(null);
  const [step, setStep] = useState('start'); // 'start' | 'share_phone'
  const [error, setError] = useState('');
  const done = useRef(false);

  const createLink = async () => {
    setError('');
    try {
      const res = await trackerApi.post('/telegram/link');
      setUrl(res.data.url);
      setStep('start');
    } catch (err) {
      setError(errorText(err));
    }
  };

  const check = async () => {
    if (done.current) {
      return;
    }
    try {
      const res = await trackerApi.post('/telegram/verify');
      if (res.data.step === 'connected') {
        done.current = true;
        onConnected(res.data.user);
      } else {
        setStep(res.data.step);
      }
    } catch (err) {
      // the shared number didn't match: show why and offer a fresh link
      setError(errorText(err));
      setUrl(null);
    }
  };

  useEffect(() => {
    createLink();
  }, []);

  // follow progress: every few seconds, and as soon as the app comes back to the front
  useEffect(() => {
    if (!url) {
      return;
    }
    const timer = setInterval(check, 3000);
    const onAppState = state => state === 'active' && check();
    AppState.addEventListener('change', onAppState); // RN 0.64 API
    return () => {
      clearInterval(timer);
      AppState.removeEventListener('change', onAppState);
    };
  }, [url]);

  if (error && !url) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>{error}</Text>
        <FormButton buttonTitle="Try again" onPress={createLink} />
      </View>
    );
  }
  if (!url) {
    return <ActivityIndicator color={colors.primary} style={{marginVertical: 40}} />;
  }

  return (
    <View style={styles.card}>
      {step === 'start' ? (
        <>
          <Text style={styles.text}>
            On the caregiver's phone, scan this with the camera. Telegram opens: tap{' '}
            <Text style={styles.bold}>Start</Text>, then <Text style={styles.bold}>Share my phone number</Text>.
          </Text>
          <View style={styles.qr}>
            <QRCode value={url} size={200} />
          </View>
          <FormButton
            buttonTitle="Share link instead"
            variant="secondary"
            onPress={() => Share.share({message: `Tap to get SafeWalk alerts on Telegram: ${url}`})}
          />
          <FormButton
            buttonTitle="Telegram is on this phone"
            variant="secondary"
            onPress={() => Linking.openURL(url)}
          />
        </>
      ) : (
        <View style={styles.row}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <Text style={[styles.text, {flex: 1, marginLeft: 8}]}>
            Started. Now tap <Text style={styles.bold}>Share my phone number</Text> in Telegram (it must be{' '}
            {phone}).
          </Text>
        </View>
      )}
      <View style={[styles.row, {marginTop: 14}]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.waiting}>Waiting for Telegram. This continues by itself.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {...card, marginBottom: 12},
  text: {fontSize: 15, color: colors.text, lineHeight: 21},
  bold: {fontWeight: 'bold'},
  qr: {alignItems: 'center', marginVertical: 18},
  row: {flexDirection: 'row', alignItems: 'center'},
  waiting: {fontSize: 13, color: colors.primary, marginLeft: 8},
  error: {color: colors.danger, fontSize: 14, marginBottom: 4},
});

export default TelegramConnect;
