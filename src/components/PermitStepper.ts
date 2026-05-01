import { createElement } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

export type PermitStepperVariant = 'dots' | 'bar' | 'numbers';

export interface PermitStepperProps {
  current: number;
  total: number;
  variant?: PermitStepperVariant;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PermitStepper({
  current,
  total,
  variant = 'dots',
  activeColor = '#2563eb',
  inactiveColor = '#d1d5db',
  style,
  textStyle,
}: PermitStepperProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal - 1);

  if (variant === 'numbers') {
    return createElement(
      Text,
      { style: [{ color: activeColor, fontWeight: '600' }, textStyle] },
      `${safeCurrent + 1} / ${safeTotal}`,
    );
  }

  if (variant === 'bar') {
    return createElement(
      View,
      {
        style: [
          { height: 4, borderRadius: 2, backgroundColor: inactiveColor, overflow: 'hidden', width: '100%' },
          style,
        ],
      },
      createElement(View, {
        style: {
          height: 4,
          width: `${((safeCurrent + 1) / safeTotal) * 100}%`,
          backgroundColor: activeColor,
        },
      }),
    );
  }

  return createElement(
    View,
    { style: [{ flexDirection: 'row', gap: 6, alignItems: 'center' }, style] },
    ...Array.from({ length: safeTotal }, (_, index) =>
      createElement(View, {
        key: index,
        style: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: index <= safeCurrent ? activeColor : inactiveColor,
        },
      }),
    ),
  );
}
