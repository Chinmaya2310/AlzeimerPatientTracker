import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../theme';

// variant: 'primary' | 'secondary' | 'danger'
const FormButton = ({buttonTitle, variant = 'primary', style, ...rest}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], style]}
      activeOpacity={0.8}
      {...rest}>
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>
        {buttonTitle}
      </Text>
    </TouchableOpacity>
  );
};

export default FormButton;

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  primary: {backgroundColor: colors.primary},
  danger: {backgroundColor: colors.danger},
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {fontSize: 16, fontWeight: 'bold', color: '#fff'},
  secondaryText: {color: colors.text},
});
