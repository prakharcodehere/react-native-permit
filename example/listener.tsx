import { useEffect } from 'react';
import { usePermitListener } from 'react-native-permit';

export function LocationListener() {
  usePermitListener(
    'location',
    (status) => {
      console.log('location changed', status);
    },
    { fireImmediately: true },
  );

  useEffect(() => {
    console.log('mount feature that reacts to location permission');
  }, []);

  return null;
}
