import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FormInput from './FormInput';
import FormButton from './FormButton';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as UserContext} from '../context/UserContext';
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
  const {state: userState} = useContext(UserContext);
  const hasZone = !!userState.user.homeLocation;

  return (
    <View style={styles.container}>
      <FormInput
        labelValue={name}
        onChangeText={changeName}
        placeholderText="Name this walk (e.g. Evening walk)"
        iconType="edit"
        autoCorrect={false}
      />
      {!hasZone && !recording ? (
        <FormButton buttonTitle="Set safe zone to start" onPress={() => navigation.navigate('SafeZone')} />
      ) : recording ? (
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
