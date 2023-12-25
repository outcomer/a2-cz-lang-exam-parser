"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchOptions = void 0;
const tracer_1 = require("./tracer");
/**
 * Runtime config container.
 */
class LaunchOptions {
    _config;
    _tracer;
    /**
     * Constructor.
     */
    constructor(config) {
        this._config = config;
        this._tracer = new tracer_1.Tracer();
    }
    /**
     * Getter.
     */
    get toCatcha() {
        return this._config.toCaptcha;
    }
    /**
     * Getter.
     */
    get notifications() {
        return this._config.notifications;
    }
    /**
     * Getter.
     */
    get context() {
        return this._config.context;
    }
    /**
     * Getter.
     */
    get slotPage() {
        return this._config.slotPage;
    }
    /**
     * Getter.
     */
    get cron() {
        return this._config.cron;
    }
    /**
     * Getter.
     */
    get tracer() {
        return this._tracer;
    }
}
exports.LaunchOptions = LaunchOptions;
