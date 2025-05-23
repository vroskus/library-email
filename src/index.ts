// Global Types
import type {
  Transporter,
  TransportOptions,
} from 'nodemailer';

// Helpers
import nodemailer from 'nodemailer';
import {
  htmlToText,
} from 'html-to-text';

// Types
import type {
  $Config as Config,
} from './types';

export type $Config = Config;

type $Auth = {
  pass: string;
  user: string;
};

type $SendEmailResponse = {
  accepted: Array<string>;
  messageId: string;
  pending: Array<string>;
  rejected: Array<string>;
  response: string;
};

type $SendMailParams = {
  bcc?: Array<string> | string;
  from: string;
  html: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: Array<string> | string;
};

type $Transporter = Transporter | {
  sendMail: (arg0: $SendMailParams) => Promise<$SendEmailResponse>;
};

type $TransporterParams = TransportOptions & {
  auth?: $Auth;
  host: string;
  port: string;
  secure?: boolean;
};

class EmailService<C extends Config> {
  from: string;

  transporter: $Transporter | null;

  constructor({
    email,
    from,
    host,
    password,
    port,
    username,
  }: C) {
    this.from = `"${from}" <${email}>`;

    this.transporter = null;

    this.#setupTransporter({
      host,
      password,
      port: port || '25',
      username,
    });
  }

  #setupTransporter({
    host,
    password,
    port,
    username,
  }: {
    host: string;
    password?: string;
    port: string;
    username?: string;
  }): void {
    this.transporter = {
      sendMail: async ({
        bcc,
        html,
        subject,
        text,
        to,
      }) => {
        // eslint-disable-next-line no-console
        console.log(
          '\x1b[33m',
          'EmailService.sendEmail',
          '\x1b[0m\x1b[90m',
          to,
          bcc,
          subject,
          JSON.stringify(html),
          JSON.stringify(text),
        );

        return {
          accepted: Array.isArray(to) ? to : [to],
          messageId: '0',
          pending: [],
          rejected: [],
          response: 'Email sent by dummy service',
        };
      },
    };

    if (host !== '') {
      let auth: $Auth | undefined;

      if (username && password) {
        auth = {
          pass: password,
          user: username,
        };
      }

      const params: $TransporterParams = {
        auth,
        host,
        port,
        secure: false,
      };

      this.transporter = nodemailer.createTransport(params);
    }
  }

  async sendMail({
    bcc,
    content,
    replyTo,
    subject,
    to,
  }: {
    bcc?: Array<string> | string;
    content: string;
    replyTo?: string;
    subject: string;
    to: Array<string> | string;
  }): Promise<string> {
    const params = {
      bcc,
      from: this.from,
      html: content,
      replyTo,
      subject,
      text: htmlToText(content),
      to,
    };

    if (this.transporter !== null) {
      const info: $SendEmailResponse = await this.transporter.sendMail(params);

      // eslint-disable-next-line no-console
      console.log(
        'info',
        info,
      );

      return info.messageId;
    }

    throw new Error('Transporter not initialised');
  }
}

export default EmailService;
