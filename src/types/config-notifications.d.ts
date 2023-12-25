interface TelegramChannelNotificationInterface {
    active: boolean;

    /**
     * Bot token.
     */
    token: string;

    /**
     * Groups or channels tokens for prod messaging.
     * Those are only that contains succesfull parsing
     * results.
     */
    live: {
        chats: string[];
    };

    /**
     * Groups or channels tokens for dev messaging.
     */
    dev: {
        chats: string[];

        // Whether to send an errors if any.
        reportErrors: boolean;

        //  Whether to send message even if there was no positive results.
        reportAttempt: boolean;

        //  Whether to include runtime tracing data into message.
        reportTrace: boolean;
    };
}

interface EmailChannelNotificationInterface {
    active: boolean;
    gMailUser: string;
    gAppPass: string;

    /**
     * Groups or channels tokens for prod messaging.
     * Those are only that contains succesfull parsing
     * results.
     */
    live: {
        sendTo: string[];
        subjectSuccess: string;
        subjectError: string;
    };

    /**
     * Groups or channels tokens for dev messaging.
     */
    dev: {
        sendTo: string[];

        // String for mail subject if slots exists.
        subjectSuccess: string;

        // String for mail subject if nothing was parsed.
        subjectEmpty: string;

        // String for mail subject for errors in parser.
        subjectError: string;

        // Whether to send an errors if any.
        reportErrors: boolean;

        //  Whether to send message even if there was no positive results.
        reportAttempt: boolean;

        //  Whether to include runtime tracing data into message.
        reportTrace: boolean;
    };
}

interface NotificationsChannelsInterface {
    telegram: TelegramChannelNotificationInterface;
    email: EmailChannelNotificationInterface;
}

/**
 * Will be used for messages with non-empty
 * slots parsing results.
 */
interface RepeatSuccefullMessageInterface {
    num: number;
    intervalSec: number;
}

export interface NotificatorOptionsInterface {
    channels: NotificationsChannelsInterface;
    repeatSuccefullMessage: RepeatSuccefullMessageInterface;
}
