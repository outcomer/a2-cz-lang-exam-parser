import { MsgEmailInterface } from '../types/app';
/**
 * Classic email client that can send mail.
 */
export declare class ClientEmail {
    private _gMailUser;
    private _gAppPass;
    private _transport;
    private _logger;
    /**
     * Constructor.
     */
    constructor(gMailUser: string, gAppPass: string);
    /**
     * Message dispatcher.
     */
    send(message: MsgEmailInterface): Promise<void>;
}
