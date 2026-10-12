import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme';

const Icon = ({name, color, bg}) => (
  <View style={[styles.iconWrap, {backgroundColor: bg}]}>
    <Ionicons name={name} size={84} color={color} />
  </View>
);

const NavButton = ({label, ...props}) => (
  <TouchableOpacity style={styles.navButton} {...props}>
    <Text style={styles.navText}>{label}</Text>
  </TouchableOpacity>
);

const OnBoarding = ({navigation}) => {
  return (
    <Onboarding
      onSkip={() => navigation.replace('Login')}
      onDone={() => navigation.replace('Login')}
      SkipButtonComponent={props => <NavButton label="Skip" {...props} />}
      NextButtonComponent={props => <NavButton label="Next" {...props} />}
      DoneButtonComponent={props => <NavButton label="Get started" {...props} />}
      bottomBarColor={colors.background}
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
      pages={[
        {
          backgroundColor: colors.background,
          image: <Icon name="walk" color={colors.primary} bg={colors.primarySoft} />,
          title: 'Track every walk',
          subtitle: 'Record the route live on a map while your loved one is out walking.',
        },
        {
          backgroundColor: colors.background,
          image: <Icon name="shield-checkmark" color={colors.success} bg={colors.successSoft} />,
          title: 'Set a safe zone',
          subtitle: 'Choose how far from the starting point the patient can safely go.',
        },
        {
          backgroundColor: colors.background,
          image: <Icon name="chatbubble-ellipses" color={colors.danger} bg={colors.dangerSoft} />,
          title: 'Get an SMS alert',
          subtitle: 'If they leave the safe zone, you get a text with their live location on Google Maps.',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {fontSize: 26, fontWeight: 'bold', color: colors.text},
  subtitle: {fontSize: 16, color: colors.muted, paddingHorizontal: 24, lineHeight: 22},
  navButton: {paddingHorizontal: 20, paddingVertical: 10},
  navText: {fontSize: 16, fontWeight: 'bold', color: colors.primary},
});

export default OnBoarding;
