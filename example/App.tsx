import React from 'react';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Permit, usePermit, usePermits } from 'react-native-permit';
import { CustomPermissionOnboarding } from './custom-sequence';
import { CameraScreenExample } from './permission-gate';

function CameraExample() {
  const camera = usePermit('camera');

  return (
    <View>
      <Text>Camera status: {camera.status}</Text>
      <Button
        title="Request camera"
        onPress={() =>
          camera.request({
            retry: {
              maxAttempts: 2,
              onRetriesExhausted: (permission) => console.log('exhausted', permission),
            },
          })
        }
      />
      <Button title="Open settings" onPress={camera.openSettings} />
      <Button title="Clear exhaustion" onPress={camera.clearExhaustion} />
    </View>
  );
}

function RecordingExample() {
  const recording = usePermits(['camera', 'microphone']);

  return (
    <View>
      <Text>Camera: {recording.statuses.camera ?? 'unknown'}</Text>
      <Text>Microphone: {recording.statuses.microphone ?? 'unknown'}</Text>
      <Text>Ready to record: {recording.allGranted ? 'yes' : 'no'}</Text>
      <Button
        title="Request camera and microphone"
        onPress={async () => {
          await Permit.request('camera');
          await Permit.request('microphone');
          await recording.check();
        }}
      />
    </View>
  );
}

function NotificationsExample() {
  return (
    <View>
      <Button
        title="Request notifications"
        onPress={async () => {
          const result = await Permit.request('notifications', {
            notifications: { alert: true, badge: true, sound: true },
          });
          console.log('notifications result', result);
        }}
      />
      <Button
        title="Request provisional notifications"
        onPress={async () => {
          const result = await Permit.request('notifications', {
            notifications: { provisional: true },
          });
          console.log('provisional result', result);
        }}
      />
    </View>
  );
}

function PersistentRetryExample() {
  return (
    <View>
      <Button
        title="Request location with persisted exhaustion"
        onPress={() =>
          Permit.request('location', {
            retry: {
              maxAttempts: 3,
              persistExhaustion: true,
              resetExhaustionAfterDays: 30,
            },
          })
        }
      />
      <Button title="Reset location exhaustion" onPress={() => Permit.clearExhaustion('location')} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ gap: 24, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>react-native-permit</Text>
        <CameraExample />
        <RecordingExample />
        <NotificationsExample />
        <PersistentRetryExample />
        <CustomPermissionOnboarding />
        <CameraScreenExample />
      </ScrollView>
    </SafeAreaView>
  );
}
