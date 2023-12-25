/**
 * Class for accumulating various
 * info during runtime.
 */
export declare class Tracer {
    private _trace;
    /**
     * Getter.
     */
    get trace(): {
        dev: string[];
        live: string[];
    };
    /**
     * Getter.
     */
    flush(): void;
    /**
     * Adder.
     */
    addTrace(channel: 'dev' | 'live', item: string): void;
}
