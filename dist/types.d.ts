export type PermissionKey = 'camera' | 'microphone' | 'location' | 'location-coarse' | 'location-always' | 'notifications' | 'photo-library' | 'photo-library-add' | 'contacts' | 'calendar' | 'reminders' | 'bluetooth' | 'motion' | 'face-id' | 'tracking' | 'speech-recognition' | 'body-sensors' | 'activity-recognition' | 'nearby-wifi-devices' | 'media-location';
export type PermitStatus = 'granted' | 'limited' | 'provisional' | 'denied' | 'blocked' | 'unavailable' | 'unknown';
export type PermitResult = PermitStatus | 'skipped' | 'exhausted' | 'cancelled';
export interface PermitStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export interface RetryConfig {
    maxAttempts?: number;
    persistExhaustion?: boolean;
    resetExhaustionAfterDays?: number;
    persistenceKey?: string;
    cooldownMs?: number;
    onAttempt?: (attempt: number, maxAttempts: number) => void;
    onRetriesExhausted?: (permission: PermissionKey) => void;
}
export interface NotificationOptions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
    provisional?: boolean;
    criticalAlert?: boolean;
    announcement?: boolean;
    carPlay?: boolean;
}
export interface PermitRequestOptions {
    retry?: RetryConfig;
    notifications?: NotificationOptions;
    signal?: PermitAbortSignal;
    onGranted?: () => void;
    onDenied?: () => void;
    onBlocked?: () => void;
    onSkipped?: () => void;
    onExhausted?: () => void;
}
export interface RationaleConfig {
    title: string;
    message: string;
    continueLabel?: string;
    skipLabel?: string;
    accentColor?: string;
}
export interface PermitStep {
    permission: PermissionKey;
    rationale: RationaleConfig;
    optional?: boolean;
    skipIfGranted?: boolean;
    retry?: RetryConfig;
    notifications?: NotificationOptions;
}
export type PermitSequenceResults = Partial<Record<PermissionKey, PermitResult>>;
export type PermitSequenceState = 'idle' | 'checking' | 'rationale' | 'requesting' | 'denied' | 'exhausted' | 'complete';
export interface PermitSequenceOptions {
    onComplete?: (results: PermitSequenceResults) => void;
    onRequiredDenied?: (permission: PermissionKey, results: PermitSequenceResults) => void;
    onAbandon?: (permission: PermissionKey, results: PermitSequenceResults) => void;
}
export interface UsePermitSequenceReturn {
    stepIndex: number;
    totalSteps: number;
    visibleStepIndex: number;
    visibleTotalSteps: number;
    currentStep: PermitStep | null;
    currentPermission: PermissionKey | null;
    attempt: number;
    maxAttempts: number;
    state: PermitSequenceState;
    results: PermitSequenceResults;
    start: () => void;
    proceed: () => Promise<void>;
    retry: () => Promise<void>;
    skip: () => void;
    advance: () => void;
    openSettings: () => Promise<void>;
    cancel: () => void;
}
export interface PermitEvent {
    type: 'system_prompt_shown' | 'granted' | 'limited' | 'provisional' | 'denied' | 'blocked' | 'unavailable' | 'settings_opened' | 'exhausted';
    permission: PermissionKey;
    attempt?: number;
    totalAttempts?: number;
}
export type PermitListener = (status: PermitStatus) => void;
export type PermitEventListener = (event: PermitEvent) => void;
export declare class PermitAbortSignal {
    aborted: boolean;
}
export declare class PermitAbortController {
    signal: PermitAbortSignal;
    abort(): void;
}
