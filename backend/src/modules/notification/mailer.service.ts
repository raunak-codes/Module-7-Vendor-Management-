import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const templates: Record<string, (d: any) => { subject: string; html: string }> = {
  VENDOR_APPROVED: ({ businessName }) => ({ subject: 'Your vendor account has been approved!', html: `<h2>Congratulations, ${businessName}!</h2><p>Your account on <strong>EventHub</strong> is now active.</p>` }),
  VENDOR_REJECTED: ({ businessName, reason }) => ({ subject: 'Vendor application update', html: `<h2>Hello ${businessName},</h2><p>Your application was not approved.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}` }),
  KYC_VERIFIED: ({ businessName, docType }) => ({ subject: 'KYC document verified', html: `<h2>Hello ${businessName},</h2><p>Your <strong>${docType}</strong> document has been verified.</p>` }),
  KYC_REJECTED: ({ businessName, docType, reason }) => ({ subject: 'KYC document rejected', html: `<h2>Hello ${businessName},</h2><p>Your <strong>${docType}</strong> was rejected.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}` }),
  PO_ISSUED: ({ businessName, poNumber, amount }) => ({ subject: `New Purchase Order ${poNumber} issued`, html: `<h2>Hello ${businessName},</h2><p>PO <strong>${poNumber}</strong> worth ₹${amount} has been issued to you.</p>` }),
  PO_ACCEPTED: ({ poNumber }) => ({ subject: `PO ${poNumber} accepted`, html: `<p>Purchase Order <strong>${poNumber}</strong> has been accepted by the vendor.</p>` }),
  PO_REJECTED: ({ poNumber, reason }) => ({ subject: `PO ${poNumber} rejected`, html: `<p>PO <strong>${poNumber}</strong> was rejected.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}` }),
  INVOICE_SUBMITTED: ({ businessName, invoiceNumber, amount }) => ({ subject: `Invoice ${invoiceNumber} submitted`, html: `<p>Vendor <strong>${businessName}</strong> submitted invoice <strong>${invoiceNumber}</strong> for ₹${amount}.</p>` }),
  INVOICE_PAID: ({ businessName, invoiceNumber, amount }) => ({ subject: `Invoice ${invoiceNumber} paid`, html: `<h2>Hello ${businessName},</h2><p>Invoice <strong>${invoiceNumber}</strong> for ₹${amount} has been paid.</p>` }),
  WORK_ORDER_ASSIGNED: ({ businessName, woNumber, description }) => ({ subject: `Work Order ${woNumber} assigned`, html: `<h2>Hello ${businessName},</h2><p>Work order <strong>${woNumber}</strong> has been assigned to you.</p><p>${description}</p>` }),
};

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASS') },
    });
  }

  async send(type: string, data: any) {
    const smtpUser = this.config.get<string>('SMTP_USER', '');
    if (!smtpUser || smtpUser === 'your-email@gmail.com') {
      this.logger.debug(`[MAILER-dev] To: ${data.email} | Type: ${type}`);
      return;
    }
    const template = templates[type];
    if (!template) return;
    const { subject, html } = template(data);
    await this.transporter.sendMail({ from: this.config.get('SMTP_FROM'), to: data.email, subject, html });
  }
}
