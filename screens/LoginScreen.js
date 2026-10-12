import React, {useContext, useState, useCallback} from 'react';
import {Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import AuthHeader from '../components/AuthHeader';
import {Context as AuthContext} from '../context/AuthContext';
import {colors} from '../theme';

const LoginScreen = ({navigation}) => {
  const {state, signin, clearError} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useFocusEffect(useCallback(() => clearError(), []));

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <AuthHeader title="SafeWalk" subtitle="Location alerts for people living with Alzheimer's" />
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
        labelValue={password}
        onChangeText={setPassword}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />
      {state.errMessage ? <Text style={styles.error}>{state.errMessage}</Text> : null}
      <FormButton buttonTitle="Sign in" onPress={() => signin({email, password})} />
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>
          New here? <Text style={styles.linkStrong}>Create an account</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginScreen;

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
