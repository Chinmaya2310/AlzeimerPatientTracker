import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Landing from '../screens/Landing';
import TrackDetails from '../screens/TrackDetails';
import EditProfileScreen from '../screens/Bottom/EditProfileScreen';
import SafeZoneScreen from '../screens/SafeZoneScreen';
import AlertChannelScreen from '../screens/AlertChannelScreen';
import TelegramSetupScreen from '../screens/TelegramSetupScreen';
import {Context as AuthContext} from '../context/AuthContext';
const Stack = createStackNavigator();

// Screens available after login: the bottom tabs plus the screens they open.
// A brand-new account starts on the safe-zone setup step.
const AppStack = () => {
  const {state} = useContext(AuthContext);
  return (
    <Stack.Navigator initialRouteName={state.needsSetup ? 'TelegramSetup' : 'Main'}>
      <Stack.Screen name="Main" component={Landing} options={{header: () => null}} />
      <Stack.Screen
        name="TelegramSetup"
        component={TelegramSetupScreen}
        options={{header: () => null}}
      />
      <Stack.Screen
        name="SafeZoneSetup"
        component={SafeZoneScreen}
        initialParams={{firstTime: true}}
        options={{header: () => null}}
      />
      <Stack.Screen
        name="SafeZone"
        component={SafeZoneScreen}
        options={{title: 'Safe zone', headerTitleAlign: 'center'}}
      />
      <Stack.Screen
        name="AlertChannel"
        component={AlertChannelScreen}
        options={{title: 'Alerts', headerTitleAlign: 'center'}}
      />
      <Stack.Screen
        name="TrackDetails"
        component={TrackDetails}
        options={{title: 'Walk', headerTitleAlign: 'center'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: 'Edit profile',
          headerTitleAlign: 'center',
          headerStyle: {backgroundColor: '#fff', elevation: 0},
        }}
      />
    </Stack.Navigator>
  );
};
export default AppStack;
