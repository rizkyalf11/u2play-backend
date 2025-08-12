import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { sendEmailDto } from './email.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}
  emailTransport() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mondokskuy19@gmail.com',
        pass: 'psal dtoz hfgt mtxg',
      },
    });
    return transporter;
  }

  async sendEmail(payload: sendEmailDto) {
    const { email, username, link } = payload;

    // const transport = this.emailTransport();
    // const options: nodemailer.SendMailOptions = {
    //     from: "mondokskuy19@gmail.com",
    //     to: recipents,
    //     subject,
    //     html
    // }

    // try {
    //   await transport.sendMail({
    //     from: '"Support" <support@example.com>',
    //     to: email,
    //     subject: 'Reset Password',
    //     template: 'reset-password', // nama file tanpa .hbs
    //     context: {
    //       name: username,
    //       resetLink: `https://example.com/reset-password?token=${token}`,
    //       year: new Date().getFullYear(),
    //     },
    //   });
    //   console.log('Email sent successfully');
    // } catch (error) {
    //   console.log('Error sending email:', error);
    // }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Forget Password', // subject pada email
        template: './reset', // template yang digunakan adalah lupa_password, kita bisa memembuat template yang lain
        context: {
          resetLink: link,
          name: username,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {}
  }
}
