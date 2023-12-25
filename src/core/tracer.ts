/**
 * Class for accumulating various
 * info during runtime.
 */
export class Tracer {
    private _trace: { dev: string[]; live: string[] } = { dev: [], live: [] };

    /**
     * Getter.
     */
    public get trace(): { dev: string[]; live: string[] } {
        return this._trace;
    }

    /**
     * Getter.
     */
    public flush(): void {
        this._trace = { dev: [], live: [] };
    }

    /**
     * Adder.
     */
    public addTrace(channel: 'dev' | 'live', item: string): void {
        this._trace[channel].push(item);
    }
}
