import { useCallback, useMemo, useState } from 'react';
import { Permit } from '../core/Permit';
import type {
  PermissionKey,
  PermitResult,
  PermitSequenceOptions,
  PermitSequenceResults,
  PermitSequenceState,
  PermitStep,
  UsePermitSequenceReturn,
} from '../types';

function maxAttempts(step: PermitStep | null) {
  return Math.max(1, step?.retry?.maxAttempts ?? 1);
}

function isSuccess(result: PermitResult) {
  return result === 'granted' || result === 'limited' || result === 'provisional';
}

export function usePermitSequence(steps: PermitStep[], options: PermitSequenceOptions = {}): UsePermitSequenceReturn {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<PermitSequenceState>('idle');
  const [attempt, setAttempt] = useState(1);
  const [results, setResults] = useState<PermitSequenceResults>({});

  const currentStep = steps[stepIndex] ?? null;
  const currentPermission = currentStep?.permission ?? null;
  const visibleSteps = useMemo(() => steps.filter((step) => !(step.skipIfGranted ?? true) || results[step.permission] !== 'granted'), [results, steps]);
  const visibleStepIndex = currentStep ? Math.max(0, visibleSteps.findIndex((step) => step.permission === currentStep.permission)) : visibleSteps.length;

  const complete = useCallback(
    (nextResults: PermitSequenceResults) => {
      setState('complete');
      options.onComplete?.(nextResults);
    },
    [options],
  );

  const moveTo = useCallback(
    async (index: number, nextResults: PermitSequenceResults) => {
      if (index >= steps.length) {
        complete(nextResults);
        return;
      }

      const nextStep = steps[index];
      setStepIndex(index);
      setAttempt(1);

      if (nextStep.skipIfGranted ?? true) {
        setState('checking');
        const status = await Permit.check(nextStep.permission, { notifications: nextStep.notifications });
        if (isSuccess(status)) {
          const skippedResults = { ...nextResults, [nextStep.permission]: status };
          setResults(skippedResults);
          await moveTo(index + 1, skippedResults);
          return;
        }
      }

      setState('rationale');
    },
    [complete, steps],
  );

  const advanceWithResult = useCallback(
    async (permission: PermissionKey, result: PermitResult) => {
      const nextResults = { ...results, [permission]: result };
      setResults(nextResults);
      await moveTo(stepIndex + 1, nextResults);
    },
    [moveTo, results, stepIndex],
  );

  const start = useCallback(() => {
    if (state !== 'idle') return;
    void moveTo(0, results);
  }, [moveTo, results, state]);

  const requestCurrent = useCallback(async () => {
    if (!currentStep) return;
    setState('requesting');

    const result = await Permit.request(currentStep.permission, {
      retry: { ...currentStep.retry, maxAttempts: 1 },
      notifications: currentStep.notifications,
    });

    if (isSuccess(result) || result === 'unavailable') {
      await advanceWithResult(currentStep.permission, result);
      return;
    }

    if (result === 'denied' && attempt < maxAttempts(currentStep)) {
      setAttempt(attempt + 1);
      setState('denied');
      return;
    }

    const nextResults = { ...results, [currentStep.permission]: result === 'denied' ? 'exhausted' : result };
    setResults(nextResults);
    setState('exhausted');
    if (!currentStep.optional) options.onRequiredDenied?.(currentStep.permission, nextResults);
  }, [advanceWithResult, attempt, currentStep, options, results]);

  const proceed = useCallback(() => requestCurrent(), [requestCurrent]);
  const retry = useCallback(() => requestCurrent(), [requestCurrent]);

  const skip = useCallback(() => {
    if (!currentStep) return;
    const result: PermitResult = 'skipped';
    const nextResults = { ...results, [currentStep.permission]: result };
    setResults(nextResults);
    void moveTo(stepIndex + 1, nextResults);
  }, [currentStep, moveTo, results, stepIndex]);

  const advance = useCallback(() => {
    if (!currentStep) return;
    void moveTo(stepIndex + 1, results);
  }, [currentStep, moveTo, results, stepIndex]);

  const cancel = useCallback(() => {
    if (currentStep) options.onAbandon?.(currentStep.permission, results);
    setState('complete');
  }, [currentStep, options, results]);

  return {
    stepIndex,
    totalSteps: steps.length,
    visibleStepIndex,
    visibleTotalSteps: visibleSteps.length,
    currentStep,
    currentPermission,
    attempt,
    maxAttempts: maxAttempts(currentStep),
    state,
    results,
    start,
    proceed,
    retry,
    skip,
    advance,
    openSettings: () => Permit.openSettings(currentPermission ?? undefined),
    cancel,
  };
}
