import React, {useContext} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import FormInput from './FormInput';
import FormButton from './FormButton';
import {Context as LocationContext} from '../context/LocationContext';
import useSaveTrack from '../hooks/useSaveTrack';
const TrackForm = () => {
  const {
    state: {name, recording, locations},
    startRecording,
    stopRecording,
    changeName,
  } = useContext(LocationContext);
  const [saveTrack] = useSaveTrack();
  // console.log('The length of location are', locations.length);
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <FormInput
          value={name}
          onChangeText={changeName}
          placeholderText="Record This Session"
          iconType="playcircleo"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {recording ? (
          <FormButton buttonTitle="Stop" onPress={stopRecording} />
        ) : (
          <FormButton buttonTitle="Record" onPress={startRecording} />
        )}
        {!recording && locations.length ? (
          <FormButton buttonTitle="Save Recording" onPress={saveTrack} />
        ) : null}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
  },
});
export default TrackForm;
