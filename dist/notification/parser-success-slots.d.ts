import { ConfigInterface } from '../types/config';
import { MsgEmailInterface } from '../types/app';
import { MsgTelegramInterface } from '../types/app';
import { ParserResultInterface } from '../types/app';
import { Slot } from '../core/slot';
import { Tracer } from '../core/tracer';
/**
 * Succesfull parser's results storage and message formatter.
 */
export declare class ParserSuccessSlots implements ParserResultInterface {
    private _event;
    private _notifyOptions;
    private _slotsOptions;
    private _slots;
    /**
     * Constructor.
     */
    constructor(notifyOptions: ConfigInterface['notifications'], slotsOptions: ConfigInterface['slotPage'], tracer: Tracer);
    /**
     * Setter.
     */
    set slots(slots: Slot[]);
    /**
     * Getter.
     */
    get slots(): Slot[];
    /**
     * Ready to send message getter.
     */
    getMessagesTelegram(remind?: boolean): MsgTelegramInterface[];
    /**
     * Ready to send message getter.
     */
    getMessagesEmail(remind?: boolean): MsgEmailInterface[];
}
