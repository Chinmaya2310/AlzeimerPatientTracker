import axios from 'axios';
import {API_URL} from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
const instance = axios.create({
  // backend address comes from config.js (see config.example.js)
  baseURL: API_URL,
  timeout: 15000,
});
instance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => {
    console.log('Here error');
    return Promise.reject(err);
  },
);
export default instance;
