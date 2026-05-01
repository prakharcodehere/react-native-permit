import React from 'react';
import { Button, Text, View } from 'react-native';
import { usePermit, type PermissionKey } from 'react-native-permit';

type PermissionGateProps = {
  permission: PermissionKey;
  children: React.ReactNode;
};

export function PermissionGate({ permission, children }: PermissionGateProps) {
  const permit = usePermit(permission);

  if (permit.status === 'unknown') {
    return <Text>Checking permission...</Text>;
  }

  if (permit.isGranted || permit.isLimited || permit.isProvisional) {
    return <>{children}</>;
  }

  if (permit.isBlocked || permit.isExhausted) {
    return (
      <View>
        <Text>{permission} is blocked.</Text>
        <Button title="Open settings" onPress={permit.openSettings} />
      </View>
    );
  }

  if (permit.isUnavailable) {
    return <Text>{permission} is not available on this device.</Text>;
  }

  return (
    <View>
      <Text>{permission} is required for this feature.</Text>
      <Button
        title={`Allow ${permission}`}
        onPress={() =>
          permit.request({
            retry: {
              maxAttempts: 2,
              persistExhaustion: true,
            },
          })
        }
      />
    </View>
  );
}

export function CameraScreenExample() {
  return (
    <PermissionGate permission="camera">
      <Text>Camera feature is mounted only after permission is granted.</Text>
    </PermissionGate>
  );
}
