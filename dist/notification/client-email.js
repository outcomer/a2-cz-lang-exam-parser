"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEmail = void 0;
const nodemailer = require("nodemailer");
const winston = require("winston");
/**
 * Classic email client that can send mail.
 */
class ClientEmail {
    _gMailUser;
    _gAppPass;
    _transport;
    _logger;
    /**
     * Constructor.
     */
    constructor(gMailUser, gAppPass) {
        this._gMailUser = gMailUser;
        this._gAppPass = gAppPass;
        this._transport = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: this._gMailUser,
                pass: this._gAppPass,
            },
            tls: {
                ciphers: 'SSLv3',
            },
        });
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ stack, timestamp }) => {
                return `${timestamp} ${stack}`;
            })),
            transports: [
                new winston.transports.File({
                    filename: './a2-error-email.log',
                    level: 'error',
                    maxsize: 5120000,
                    maxFiles: 20,
                }),
            ],
        });
    }
    /**
     * Message dispatcher.
     */
    async send(message) {
        const mailOptions = {
            from: `CZ language exam parser <${this._gMailUser}>`,
            to: message.to.join(','),
            subject: message.subject,
            html: message.body,
            headers: {
                'Message-ID': this._gMailUser,
            },
        };
        try {
            await this._transport.sendMail(mailOptions);
        }
        catch (error) {
            this._logger.error(new Error(`Error sending email message: ${message.body}`));
            const mailOptions = {
                from: `CZ language exam parser <${this._gMailUser}>`,
                to: message.to.join(','),
                subject: `Err: ${message.subject}`,
                html: `Error sending message. Original message saved in email error log. Service responded: ${error.toString()}`,
                headers: {
                    'Message-ID': this._gMailUser,
                },
            };
            await this._transport.sendMail(mailOptions);
        }
    }
}
exports.ClientEmail = ClientEmail;
