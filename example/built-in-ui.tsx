import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Permit, PermitDialog } from 'react-native-permit';

export function BuiltInModalExample() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button title="Show camera modal" onPress={() => setVisible(true)} />
      <PermitDialog
        visible={visible}
        presentation="modal"
        title="Camera access"
        message="Camera access is used to scan QR codes."
        primaryLabel="Allow camera"
        secondaryLabel="Not now"
        onPrimary={async () => {
          setVisible(false);
          await Permit.request('camera');
        }}
        onSecondary={() => setVisible(false)}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}

export function BuiltInBottomSheetExample() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button title="Show location sheet" onPress={() => setVisible(true)} />
      <PermitDialog
        visible={visible}
        presentation="bottom-sheet"
        title="Use your location"
        message="Location helps show nearby stores and delivery estimates."
        primaryLabel="Allow location"
        secondaryLabel="Skip"
        accentColor="#059669"
        onPrimary={async () => {
          setVisible(false);
          await Permit.request('location');
        }}
        onSecondary={() => setVisible(false)}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}

export function BuiltInScreenExample() {
  return (
    <PermitDialog
      presentation="screen"
      title="Enable notifications"
      message="Notifications keep you updated when background work finishes."
      primaryLabel="Enable notifications"
      secondaryLabel="Maybe later"
      accentColor="#7c3aed"
      onPrimary={() => Permit.request('notifications', { notifications: { alert: true, badge: true, sound: true } })}
      onSecondary={() => console.log('notifications skipped')}
    />
  );
}

export function BuiltInInlineExample() {
  return (
    <View>
      <Text>Inline permission card</Text>
      <PermitDialog
        presentation="inline"
        title="Microphone access"
        message="Microphone access lets you record voice notes."
        primaryLabel="Allow microphone"
        secondaryLabel="Skip"
        onPrimary={() => Permit.request('microphone')}
        onSecondary={() => console.log('microphone skipped')}
      />
    </View>
  );
}
