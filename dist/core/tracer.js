"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
/**
 * Class for accumulating various
 * info during runtime.
 */
class Tracer {
    _trace = { dev: [], live: [] };
    /**
     * Getter.
     */
    get trace() {
        return this._trace;
    }
    /**
     * Getter.
     */
    flush() {
        this._trace = { dev: [], live: [] };
    }
    /**
     * Adder.
     */
    addTrace(channel, item) {
        this._trace[channel].push(item);
    }
}
exports.Tracer = Tracer;
