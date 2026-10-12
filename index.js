// TextEncoder/TextDecoder for the QR code library (missing from this RN version's JS engine)
import 'fast-text-encoding';
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
