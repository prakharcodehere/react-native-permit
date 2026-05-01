import { type ReactNode } from 'react';
import { type TextStyle, type ViewStyle } from 'react-native';
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
export declare function PermitDialog(props: PermitDialogProps): unknown;
