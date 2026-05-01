export class PermitAbortSignal {
    constructor() {
        this.aborted = false;
    }
}
export class PermitAbortController {
    constructor() {
        this.signal = new PermitAbortSignal();
    }
    abort() {
        this.signal.aborted = true;
    }
}
