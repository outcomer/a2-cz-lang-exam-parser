export interface ContextOptionsInterface {
    /**
     * Will be used as a proxy for target page request.
     * Best approach is to use some rotating proxy
     * credentials, so each request will goes through
     * different IP. Supported http protocol and authorization.
     */
    proxy: string | void;

    /**
     * Once reached parser session will be destroyed forcibly.
     * In miliseconds.
     */
    timeout: number;
}
