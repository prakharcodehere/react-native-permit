import React from 'react';
import { Button, Text, View } from 'react-native';
import { PermitStepper, usePermitSequence, type PermitStep } from 'react-native-permit';

const onboardingSteps: PermitStep[] = [
  {
    permission: 'camera',
    rationale: {
      title: 'Scan items',
      message: 'Camera access lets you scan barcodes and QR codes.',
      continueLabel: 'Allow camera',
    },
    retry: { maxAttempts: 2 },
  },
  {
    permission: 'microphone',
    optional: true,
    rationale: {
      title: 'Record audio',
      message: 'Microphone access lets you attach voice notes.',
      continueLabel: 'Allow microphone',
      skipLabel: 'Skip audio',
    },
  },
  {
    permission: 'notifications',
    optional: true,
    rationale: {
      title: 'Stay updated',
      message: 'Notifications tell you when important work is done.',
      continueLabel: 'Enable notifications',
      skipLabel: 'Maybe later',
    },
    notifications: { alert: true, badge: true, sound: true },
  },
];

export function CustomPermissionOnboarding() {
  const sequence = usePermitSequence(onboardingSteps, {
    onComplete: (results) => {
      console.log('permission onboarding complete', results);
    },
    onRequiredDenied: (permission, results) => {
      console.log('required permission denied', permission, results);
    },
    onAbandon: (permission, results) => {
      console.log('sequence abandoned at', permission, results);
    },
  });

  if (sequence.state === 'idle') {
    return <Button title="Start permission onboarding" onPress={sequence.start} />;
  }

  if (sequence.state === 'complete') {
    return <Text>Permission onboarding complete.</Text>;
  }

  if (!sequence.currentStep) {
    return null;
  }

  if (sequence.state === 'checking') {
    return <Text>Checking {sequence.currentPermission}...</Text>;
  }

  if (sequence.state === 'denied') {
    return (
      <View>
        <Text>{sequence.currentStep.rationale.title}</Text>
        <Text>
          Attempt {sequence.attempt} of {sequence.maxAttempts}
        </Text>
        <Button title="Try again" onPress={sequence.retry} />
        {sequence.currentStep.optional && <Button title="Skip" onPress={sequence.skip} />}
      </View>
    );
  }

  if (sequence.state === 'exhausted') {
    return (
      <View>
        <Text>{sequence.currentPermission} was not granted.</Text>
        <Button title="Open settings" onPress={sequence.openSettings} />
        {sequence.currentStep.optional && <Button title="Continue without it" onPress={sequence.advance} />}
      </View>
    );
  }

  return (
    <View>
      <PermitStepper
        current={sequence.visibleStepIndex}
        total={sequence.visibleTotalSteps}
        variant="dots"
      />
      <Text>{sequence.currentStep.rationale.title}</Text>
      <Text>{sequence.currentStep.rationale.message}</Text>
      <Button
        title={sequence.currentStep.rationale.continueLabel ?? 'Continue'}
        onPress={sequence.proceed}
        disabled={sequence.state === 'requesting'}
      />
      {sequence.currentStep.optional && (
        <Button
          title={sequence.currentStep.rationale.skipLabel ?? 'Not now'}
          onPress={sequence.skip}
        />
      )}
      <Button title="Cancel" onPress={sequence.cancel} />
    </View>
  );
}
