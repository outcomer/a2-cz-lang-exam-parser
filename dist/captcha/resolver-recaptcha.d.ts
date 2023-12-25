import { PageInterface } from '../types/app';
import { Tracer } from '../core/tracer';
export declare class ResolverRecaptcha {
    private _page;
    private _tracer;
    private _solver;
    /**
     * Constructor.
     */
    constructor(toCaptchaSecretKey: string, page: PageInterface, tracer: Tracer);
    /**
     * Captcha resolver.
     */
    resolve(): Promise<void>;
    /**
     * Resolves captcha and gets solution token.
     */
    private solveCaptcha;
}
