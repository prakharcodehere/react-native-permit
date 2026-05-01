import React from 'react';
import { Button, Text, View } from 'react-native';
import { usePermit, usePermits } from 'react-native-permit';

export function SinglePermissionHook() {
  const camera = usePermit('camera', {
    recheckOnForeground: true,
    recheckOnMount: true,
  });

  if (camera.status === 'unknown') {
    return <Text>Checking camera permission...</Text>;
  }

  return (
    <View>
      <Text>Camera status: {camera.status}</Text>
      <Text>Granted: {camera.isGranted ? 'yes' : 'no'}</Text>
      <Text>Blocked: {camera.isBlocked ? 'yes' : 'no'}</Text>
      <Button title="Request camera" onPress={() => camera.request()} />
      <Button title="Check again" onPress={camera.check} />
      <Button title="Open settings" onPress={camera.openSettings} />
    </View>
  );
}

export function MultiplePermissionHook() {
  const recording = usePermits(['camera', 'microphone']);

  return (
    <View>
      <Text>Camera: {recording.statuses.camera ?? 'unknown'}</Text>
      <Text>Microphone: {recording.statuses.microphone ?? 'unknown'}</Text>
      <Text>All granted: {recording.allGranted ? 'yes' : 'no'}</Text>
      <Text>Some granted: {recording.someGranted ? 'yes' : 'no'}</Text>
      <Button title="Refresh statuses" onPress={recording.check} />
    </View>
  );
}
