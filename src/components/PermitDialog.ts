import { createElement, type ReactNode } from 'react';
import { Modal, Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';

export type PermitPresentation = 'modal' | 'bottom-sheet' | 'screen' | 'inline';

export interface PermitDialogProps {
  visible?: boolean;
  presentation?: PermitPresentation;
  title: string;
  message?: string;
  icon?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  accentColor?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

function panelStyle(presentation: PermitPresentation): ViewStyle {
  if (presentation === 'screen') {
    return {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#ffffff',
    };
  }

  return {
    width: '100%',
    maxWidth: presentation === 'modal' ? 360 : undefined,
    borderRadius: presentation === 'modal' ? 16 : 20,
    borderBottomLeftRadius: presentation === 'bottom-sheet' ? 0 : undefined,
    borderBottomRightRadius: presentation === 'bottom-sheet' ? 0 : undefined,
    padding: 20,
    backgroundColor: '#ffffff',
  };
}

function wrapperStyle(presentation: PermitPresentation): ViewStyle {
  if (presentation === 'bottom-sheet') {
    return {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.42)',
    };
  }

  return {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: presentation === 'modal' ? 'rgba(0,0,0,0.42)' : '#ffffff',
  };
}

function content(props: PermitDialogProps) {
  const presentation = props.presentation ?? 'bottom-sheet';
  const accentColor = props.accentColor ?? '#2563eb';

  return createElement(
    View,
    { style: [panelStyle(presentation), props.style] },
    props.icon
      ? createElement(View, { style: { alignSelf: 'flex-start', marginBottom: 12 } }, props.icon)
      : null,
    createElement(
      Text,
      { style: [{ color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 }, props.titleStyle] },
      props.title,
    ),
    props.message
      ? createElement(
          Text,
          { style: [{ color: '#4b5563', fontSize: 15, lineHeight: 22, marginBottom: 18 }, props.messageStyle] },
          props.message,
        )
      : null,
    createElement(
      Pressable,
      {
        accessibilityRole: 'button',
        onPress: props.onPrimary,
        style: {
          alignItems: 'center',
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: accentColor,
        },
      },
      createElement(Text, { style: { color: '#ffffff', fontSize: 16, fontWeight: '600' } }, props.primaryLabel ?? 'Continue'),
    ),
    props.onSecondary
      ? createElement(
          Pressable,
          {
            accessibilityRole: 'button',
            onPress: props.onSecondary,
            style: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
          },
          createElement(Text, { style: { color: '#4b5563', fontSize: 15, fontWeight: '600' } }, props.secondaryLabel ?? 'Not now'),
        )
      : null,
  );
}

export function PermitDialog(props: PermitDialogProps) {
  const presentation = props.presentation ?? 'bottom-sheet';
  const visible = props.visible ?? true;

  if (presentation === 'inline' || presentation === 'screen') {
    if (!visible) return null;
    return presentation === 'screen'
      ? createElement(View, { style: wrapperStyle(presentation) }, content(props))
      : content(props);
  }

  return createElement(
    Modal,
    {
      visible,
      transparent: true,
      animationType: presentation === 'bottom-sheet' ? 'slide' : 'fade',
      onRequestClose: props.onDismiss,
    },
    createElement(
      Pressable,
      { style: wrapperStyle(presentation), onPress: props.onDismiss },
      createElement(Pressable, { onPress: undefined }, content(props)),
    ),
  );
}
