const nodemailer = require('nodemailer');
const { smtp } = require('../config/env');

function createTransport() {
  if (!smtp.host) return nodemailer.createTransport({ jsonTransport: true });
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });
}

async function sendStatusChangeEmail(user, document) {
  try {
    const transport = createTransport();
    return await transport.sendMail({
      from: smtp.from,
      to: user.email,
      subject: `KYC document ${document.status}`,
      text: `Hello ${user.name}, your ${document.documentType.replace('_', ' ')} document has been ${document.status}.${document.rejectionReason ? ` Reason: ${document.rejectionReason}` : ''}`,
    });
  } catch (error) {
    console.error('Failed to send status change notification email:', error.message);
    return null;
  }
}

module.exports = { sendStatusChangeEmail };

