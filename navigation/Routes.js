import React, {useContext, useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {Context as AuthContext} from '../context/AuthContext';

const Routes = () => {
  const {state, tryLocalSignin} = useContext(AuthContext);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    tryLocalSignin().finally(() => setReady(true));
  }, []);
  if (!ready) {
    return null;
  }
  return (
    <NavigationContainer>
      {state.token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
