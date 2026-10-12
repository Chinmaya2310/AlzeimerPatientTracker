import React, {useState, useEffect, useContext} from 'react';
import {Context as AuthContext} from '../../context/AuthContext';
import UserAvatar from 'react-native-user-avatar';
import {windowHeight, windowWidth} from '../../utils/Dimension';
import Profile from '../../assets/Profile.svg';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Context as UserContext} from '../../context/UserContext';
const Account = ({navigation, route}) => {
  const [userData, setUserData] = useState({});
  const {state, signout} = useContext(AuthContext);
  const {
    state: {user},
    getInfoUser,
  } = useContext(UserContext);
  useEffect(() => {
    const aa = async () => {
      await getInfoUser();
    };
    aa();
    setUserData(user);
  }, [user.email]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
        showsVerticalScrollIndicator={false}>
        <UserAvatar size={200} style={styles.userImg} name="Avishay Bar" />
        <Text style={styles.userName}>
          {userData ? userData.name || 'Test' : 'Test'}{' '}
        </Text>
        <Text style={styles.aboutUser}>
          {userData ? userData.phone || 'No details added.' : ''}
        </Text>
        <View style={styles.userBtnWrapper}>
          {route.params ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>Follow</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}>
                <Text style={styles.userBtnTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  signout();
                }}>
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{user.dist}</Text>
            <Text style={styles.userInfoSubTitle}>KM</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{user.city}</Text>
            <Text style={styles.userInfoSubTitle}>CITY</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Trial</Text>
            <Text style={styles.userInfoSubTitle}>Version</Text>
          </View>
        </View>
        <Profile
          height={windowHeight / 2}
          width={windowWidth / 1.2}
          style={styles.welcome}
          fill="#000"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcome: {
    height: 30,
    resizeMode: 'center',
    width: 30,
    flex: 1,
    aspectRatio: 1,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
