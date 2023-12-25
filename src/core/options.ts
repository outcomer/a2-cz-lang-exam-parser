import { ConfigInterface } from '../types/config';
import { Tracer } from './tracer';

/**
 * Runtime config container.
 */
export class LaunchOptions {
    private readonly _config: ConfigInterface;
    private readonly _tracer: Tracer;

    /**
     * Constructor.
     */
    constructor(config: ConfigInterface) {
        this._config = config;
        this._tracer = new Tracer();
    }

    /**
     * Getter.
     */
    public get toCatcha(): ConfigInterface['toCaptcha'] {
        return this._config.toCaptcha;
    }

    /**
     * Getter.
     */
    public get notifications(): ConfigInterface['notifications'] {
        return this._config.notifications;
    }

    /**
     * Getter.
     */
    public get context(): ConfigInterface['context'] {
        return this._config.context;
    }

    /**
     * Getter.
     */
    public get slotPage(): ConfigInterface['slotPage'] {
        return this._config.slotPage;
    }

    /**
     * Getter.
     */
    public get cron(): ConfigInterface['cron'] {
        return this._config.cron;
    }

    /**
     * Getter.
     */
    public get tracer(): Tracer {
        return this._tracer;
    }
}
