import { type TextStyle, type ViewStyle } from 'react-native';
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
export declare function PermitStepper({ current, total, variant, activeColor, inactiveColor, style, textStyle, }: PermitStepperProps): unknown;
