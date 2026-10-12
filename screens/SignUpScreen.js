import React, {useContext, useState, useCallback} from 'react';
import {Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import AuthHeader from '../components/AuthHeader';
import {Context as AuthContext} from '../context/AuthContext';
import {colors} from '../theme';

const SignupScreen = ({navigation}) => {
  const {state, signup, clearError} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  useFocusEffect(useCallback(() => clearError(), []));

  const onSignUp = () => {
    if (!email || !password || !phone) {
      return setFormError('Please fill in email, password and phone number.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setFormError('Enter a valid email address.');
    }
    if (password.length < 6) {
      return setFormError('Password must be at least 6 characters.');
    }
    if (!/^\d{10}$/.test(phone)) {
      return setFormError('Enter a 10-digit phone number for SMS alerts.');
    }
    if (password !== confirmPassword) {
      return setFormError('Passwords do not match.');
    }
    setFormError('');
    signup({email: email.trim().toLowerCase(), password, phone});
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <AuthHeader title="Create an account" subtitle="Alerts go by SMS to this phone, or free on Telegram (set it up in Profile)." />
      <FormInput
        labelValue={email}
        onChangeText={setEmail}
        placeholderText="Email"
        iconType="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FormInput
        labelValue={phone}
        onChangeText={setPhone}
        placeholderText="Caregiver phone number"
        iconType="phone"
        keyboardType="phone-pad"
      />
      <FormInput
        labelValue={password}
        onChangeText={setPassword}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />
      <FormInput
        labelValue={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderText="Confirm password"
        iconType="lock"
        secureTextEntry={true}
      />
      {formError || state.errMessage ? (
        <Text style={styles.error}>{formError || state.errMessage}</Text>
      ) : null}
      <FormButton buttonTitle="Create account" onPress={onSignUp} />
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkStrong}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  error: {color: colors.danger, marginTop: 6},
  link: {marginTop: 24, alignItems: 'center'},
  linkText: {fontSize: 15, color: colors.muted},
  linkStrong: {color: colors.primary, fontWeight: 'bold'},
});
