import React, {useEffect, useState} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {colors} from '../theme';

const FormInput = ({labelValue, placeholderText, iconType, ...rest}) => {
  // Android ignores the font of a password field set on first render (it falls back to
  // monospace), so apply it again right after mount
  const [font, setFont] = useState(undefined);
  useEffect(() => setFont('sans-serif'), []);
  return (
    <View style={styles.container}>
      {iconType ? (
        <AntDesign name={iconType} size={20} color={colors.muted} style={styles.icon} />
      ) : null}
      <TextInput
        value={labelValue}
        style={[styles.input, {fontFamily: font}]}
        numberOfLines={1}
        placeholder={placeholderText}
        placeholderTextColor="#9BA1A6"
        {...rest}
      />
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
    height: 52,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
  },
  icon: {marginRight: 10},
  input: {flex: 1, fontSize: 16, color: colors.text},
});
