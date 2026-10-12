/* eslint-disable react-hooks/exhaustive-deps */
import React, {useContext, useCallback, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {SafeAreaView} from 'react-navigation';
import {useIsFocused} from '@react-navigation/native';
import useLocation from '../../hooks/useLocation';
import {Context as LocationContext} from '../../context/LocationContext';
import Maps from '../../components/Map';
import TrackForm from '../../components/TrackForm';
const Record = () => {
  const {state, addLocation} = useContext(LocationContext);
  const isFocused = useIsFocused();
  const callback = useCallback(
    location => {
      addLocation(location, state.recording);
    },
    [state.recording],
  );
  const [err] = useLocation(isFocused || state.recording, callback);
  return (
    <SafeAreaView forceInset={{top: 'always'}}>
      <View style={styles.container}>
        <Text h2>Start Tracking</Text>
      </View>
      <Maps />
      {err ? <Text>Please Enable location services</Text> : null}
      <TrackForm />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
});
export default Record;
