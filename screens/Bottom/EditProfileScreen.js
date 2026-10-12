import React, {useEffect, useContext, useState} from 'react';
import {View, Text, TextInput, ScrollView, KeyboardAvoidingView, StyleSheet} from 'react-native';
import {Context as UserContext} from '../../context/UserContext';
import Avatar from '../../components/Avatar';
import FormButton from '../../components/FormButton';
import {colors, card} from '../../theme';

const Field = ({label, hint, ...rest}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#9BA1A6" {...rest} />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const EditProfileScreen = ({navigation}) => {
  const [userData, setUserData] = useState({});
  const [error, setError] = useState('');
  const {state, getInfoUser, updateUser} = useContext(UserContext);

  useEffect(() => {
    getInfoUser();
  }, []);
  // fill the form once the profile has loaded
  useEffect(() => {
    setUserData(state.user);
  }, [state.user]);

  const set = key => txt => setUserData({...userData, [key]: txt});

  const save = async () => {
    if (!/^\d{10}$/.test(String(userData.phone || ''))) {
      return setError('Enter a 10-digit phone number for SMS alerts.');
    }
    setError('');
    await updateUser({userData: {...userData, phone: Number(userData.phone)}});
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="height">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Avatar name={userData.name} email={userData.email} size={80} />
          <Text style={styles.email}>{userData.email}</Text>
        </View>
        <View style={styles.card}>
          <Field label="Caregiver name" value={String(userData.name ?? '')} onChangeText={set('name')} placeholder="Your name" />
          <Field
            label="Phone for SMS alerts"
            value={String(userData.phone ?? '')}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
          />
          <Field label="City" value={String(userData.city ?? '')} onChangeText={set('city')} placeholder="City" />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FormButton buttonTitle="Save changes" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  header: {alignItems: 'center', marginBottom: 16},
  email: {fontSize: 14, color: colors.muted, marginTop: 8},
  card: {...card},
  field: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: 'bold', color: colors.muted, marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 16,
    color: colors.text,
  },
  hint: {fontSize: 12, color: colors.muted, marginTop: 4},
  error: {color: colors.danger, marginTop: 10},
});

export default EditProfileScreen;
