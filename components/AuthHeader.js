import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme';

const AuthHeader = ({title, subtitle}) => (
  <View style={styles.wrap}>
    <View style={styles.logo}>
      <Ionicons name="shield-checkmark" size={40} color="#fff" />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', marginBottom: 28},
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text},
  subtitle: {fontSize: 15, color: colors.muted, marginTop: 6, textAlign: 'center'},
});

export default AuthHeader;
