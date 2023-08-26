import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

type TemplateType = 'warning';
type MailOptions = ISendMailOptions & {
  template: TemplateType;
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendMail(mailOptions: MailOptions) {
    return this.mailerService.sendMail(mailOptions);
  }
}
