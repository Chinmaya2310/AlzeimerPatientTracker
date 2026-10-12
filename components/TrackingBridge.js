import {useContext, useEffect} from 'react';
import {Context as LocationContext} from '../context/LocationContext';
import {setTrackingListener} from '../services/tracking';

// Forwards events from the background tracking service into app state.
// Mounted once for the logged-in app, so it works whichever tab is open.
const TrackingBridge = () => {
  const {addLocation, setZoneStatus, setTrackingError} = useContext(LocationContext);
  useEffect(() => {
    setTrackingListener(event => {
      if (event.type === 'location') {
        addLocation(event.location, true);
      } else if (event.type === 'status') {
        setZoneStatus(event.status);
      } else if (event.type === 'error') {
        setTrackingError(event.error);
      }
    });
    return () => setTrackingListener(null);
  }, []);
  return null;
};

export default TrackingBridge;
