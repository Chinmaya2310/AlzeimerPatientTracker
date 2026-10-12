import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './Bottom/Home';
import Account from './Bottom/Account';
import Maps from './Bottom/Maps';
import Record from './Bottom/Record';
import {colors} from '../theme';
import TrackingBridge from '../components/TrackingBridge';

const Tab = createBottomTabNavigator();
const tabs = [
  {name: 'Home', component: Home, icon: 'home'},
  {name: 'Track', component: Record, icon: 'navigate'},
  {name: 'History', component: Maps, icon: 'time'},
  {name: 'Profile', component: Account, icon: 'person'},
];

const Landing = () => {
  return (
    <>
    <TrackingBridge />
    <Tab.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        activeTintColor: colors.primary,
        inactiveTintColor: colors.muted,
        labelStyle: {fontSize: 12, fontWeight: 'bold'},
        style: {height: 60, paddingBottom: 8, paddingTop: 6},
      }}>
      {tabs.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarIcon: ({color, focused}) => (
              <Ionicons name={focused ? t.icon : `${t.icon}-outline`} color={color} size={24} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
    </>
  );
};

export default Landing;
