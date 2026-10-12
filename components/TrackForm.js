import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FormInput from './FormInput';
import FormButton from './FormButton';
import {Context as LocationContext} from '../context/LocationContext';
import useSaveTrack from '../hooks/useSaveTrack';

const TrackForm = () => {
  const navigation = useNavigation();
  const {
    state: {name, recording, locations},
    startRecording,
    stopRecording,
    changeName,
  } = useContext(LocationContext);
  const [saveTrack] = useSaveTrack();

  return (
    <View style={styles.container}>
      <FormInput
        labelValue={name}
        onChangeText={changeName}
        placeholderText="Name this walk (e.g. Evening walk)"
        iconType="edit"
        autoCorrect={false}
      />
      {recording ? (
        <FormButton buttonTitle="Stop tracking" variant="danger" onPress={stopRecording} />
      ) : (
        <FormButton
          buttonTitle={locations.length ? 'Resume tracking' : 'Start tracking'}
          onPress={startRecording}
        />
      )}
      {!recording && locations.length ? (
        <FormButton
          buttonTitle="Save walk"
          variant="secondary"
          onPress={async () => {
            await saveTrack();
            navigation.navigate('History');
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: 16},
});

export default TrackForm;
