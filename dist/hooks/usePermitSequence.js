import { useCallback, useMemo, useState } from 'react';
import { Permit } from '../core/Permit';
function maxAttempts(step) {
    var _a, _b;
    return Math.max(1, (_b = (_a = step === null || step === void 0 ? void 0 : step.retry) === null || _a === void 0 ? void 0 : _a.maxAttempts) !== null && _b !== void 0 ? _b : 1);
}
function isSuccess(result) {
    return result === 'granted' || result === 'limited' || result === 'provisional';
}
export function usePermitSequence(steps, options = {}) {
    var _a, _b;
    const [stepIndex, setStepIndex] = useState(0);
    const [state, setState] = useState('idle');
    const [attempt, setAttempt] = useState(1);
    const [results, setResults] = useState({});
    const currentStep = (_a = steps[stepIndex]) !== null && _a !== void 0 ? _a : null;
    const currentPermission = (_b = currentStep === null || currentStep === void 0 ? void 0 : currentStep.permission) !== null && _b !== void 0 ? _b : null;
    const visibleSteps = useMemo(() => steps.filter((step) => { var _a; return !((_a = step.skipIfGranted) !== null && _a !== void 0 ? _a : true) || results[step.permission] !== 'granted'; }), [results, steps]);
    const visibleStepIndex = currentStep ? Math.max(0, visibleSteps.findIndex((step) => step.permission === currentStep.permission)) : visibleSteps.length;
    const complete = useCallback((nextResults) => {
        var _a;
        setState('complete');
        (_a = options.onComplete) === null || _a === void 0 ? void 0 : _a.call(options, nextResults);
    }, [options]);
    const moveTo = useCallback(async (index, nextResults) => {
        var _a;
        if (index >= steps.length) {
            complete(nextResults);
            return;
        }
        const nextStep = steps[index];
        setStepIndex(index);
        setAttempt(1);
        if ((_a = nextStep.skipIfGranted) !== null && _a !== void 0 ? _a : true) {
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
    }, [complete, steps]);
    const advanceWithResult = useCallback(async (permission, result) => {
        const nextResults = { ...results, [permission]: result };
        setResults(nextResults);
        await moveTo(stepIndex + 1, nextResults);
    }, [moveTo, results, stepIndex]);
    const start = useCallback(() => {
        if (state !== 'idle')
            return;
        void moveTo(0, results);
    }, [moveTo, results, state]);
    const requestCurrent = useCallback(async () => {
        var _a;
        if (!currentStep)
            return;
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
        if (!currentStep.optional)
            (_a = options.onRequiredDenied) === null || _a === void 0 ? void 0 : _a.call(options, currentStep.permission, nextResults);
    }, [advanceWithResult, attempt, currentStep, options, results]);
    const proceed = useCallback(() => requestCurrent(), [requestCurrent]);
    const retry = useCallback(() => requestCurrent(), [requestCurrent]);
    const skip = useCallback(() => {
        if (!currentStep)
            return;
        const result = 'skipped';
        const nextResults = { ...results, [currentStep.permission]: result };
        setResults(nextResults);
        void moveTo(stepIndex + 1, nextResults);
    }, [currentStep, moveTo, results, stepIndex]);
    const advance = useCallback(() => {
        if (!currentStep)
            return;
        void moveTo(stepIndex + 1, results);
    }, [currentStep, moveTo, results, stepIndex]);
    const cancel = useCallback(() => {
        var _a;
        if (currentStep)
            (_a = options.onAbandon) === null || _a === void 0 ? void 0 : _a.call(options, currentStep.permission, results);
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
        openSettings: () => Permit.openSettings(currentPermission !== null && currentPermission !== void 0 ? currentPermission : undefined),
        cancel,
    };
}
