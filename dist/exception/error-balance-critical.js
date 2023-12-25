"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionBalanceCritical = void 0;
/**
 * Operates with custom Error.
 */
class ExceptionBalanceCritical extends Error {
    /**
     * Constructor.
     */
    constructor(message) {
        super(message);
    }
}
exports.ExceptionBalanceCritical = ExceptionBalanceCritical;
