import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Landing from '../screens/Landing';
import TrackDetails from '../screens/TrackDetails';
import EditProfileScreen from '../screens/Bottom/EditProfileScreen';
const Stack = createStackNavigator();

// Screens available after login: the bottom tabs plus the screens they open
const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={Landing}
        options={{header: () => null}}
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
