// Global Types
import type {
  Transporter,
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

type $SendMailParams = {
  bcc?: string | Array<string>;
  from: string;
  html: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string | Array<string>;
};

type $SendEmailResponse = {
  accepted: Array<string>;
  messageId: string;
  pending: Array<string>;
  rejected: Array<string>;
  response: string;
};

type $TransporterParams = unknown;

type $Transporter = Transporter | {
  sendMail: (arg0: $SendMailParams) => Promise<$SendEmailResponse>;
};

export type $Config = Config;

class EmailService<C extends Config> {
  from: string;

  transporter: $Transporter;

  constructor({
    email,
    from,
    host,
    password,
    port,
    username,
  }: C) {
    this.from = `"${from}" <${email}>`;

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
      let auth;

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
    bcc?: string | Array<string>;
    content: string;
    replyTo?: string;
    subject: string;
    to: string | Array<string>;
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

    const info: $SendEmailResponse = await this.transporter.sendMail(params);

    // eslint-disable-next-line no-console
    console.log(
      'info',
      info,
    );

    return info.messageId;
  }
}

export default EmailService;
