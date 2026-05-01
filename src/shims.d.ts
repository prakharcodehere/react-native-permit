declare module 'react' {
  export type ReactNode = unknown;
  export function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useRef<T>(value: T): { current: T };
  export function useState<T>(value: T): [T, (value: T) => void];
  export function createElement(type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]): unknown;
}

declare module 'react-native' {
  export type ViewStyle = Record<string, unknown>;
  export type TextStyle = Record<string, unknown>;
  export const Platform: { OS: 'ios' | 'android' | string; Version: string | number };
  export const AppState: {
    addEventListener(event: 'change', listener: (state: string) => void): { remove(): void };
  };
  export const Modal: unknown;
  export const Pressable: unknown;
  export const View: unknown;
  export const Text: unknown;
}

declare module 'react-native-permissions' {
  export const RESULTS: {
    GRANTED: string;
    LIMITED: string;
    BLOCKED: string;
    UNAVAILABLE: string;
    DENIED: string;
  };

  export const PERMISSIONS: {
    IOS: Record<string, string | undefined>;
    ANDROID: Record<string, string | undefined>;
  };

  export function check(permission: string): Promise<string>;
  export function checkMultiple(permissions: string[]): Promise<Record<string, string>>;
  export function request(permission: string): Promise<string>;
  export function requestMultiple(permissions: string[]): Promise<Record<string, string>>;
  export function openSettings(): Promise<void>;
  export function checkNotifications(): Promise<{ status: string }>;
  export function requestNotifications(options: Record<string, boolean>): Promise<{ status: string }>;
}
