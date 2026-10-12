import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme';

// Initials from the user's name, falling back to the email
const initials = (name, email) => {
  const source = (name || '').trim() || (email || '').split('@')[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
};

const Avatar = ({name, email, size = 96}) => (
  <View style={[styles.circle, {width: size, height: size, borderRadius: size / 2}]}>
    <Text style={[styles.text, {fontSize: size * 0.38}]}>{initials(name, email)}</Text>
  </View>
);

const styles = StyleSheet.create({
  circle: {backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
  text: {color: '#fff', fontWeight: 'bold'},
});

export default Avatar;
