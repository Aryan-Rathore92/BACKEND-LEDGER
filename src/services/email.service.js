require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ // transporter use for communicate to the SMTP Server( gmail handler )
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail, name) {
    // const subject = "Welcome to Backend Ledger!";
    // const text = `Hello ${name}, \n\nThank you for registering at Backend Ledger,
    // We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    // const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger,
    // We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

const subject = "Welcome to Backend Ledger 🎉";

const text = `
Hello ${name},

Welcome to Backend Ledger!

Your account has been created successfully, and we're excited to have you join our community.

You can now log in and start exploring the platform.

If you have any questions or need assistance, feel free to reply to this email.

Best regards,
Backend Ledger Team
`;

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;">

<div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:30px;border:1px solid #e5e5e5;">

<h2 style="color:#333;">Welcome to Backend Ledger 🎉</h2>

<p>Hi <strong>${name}</strong>,</p>

<p>
Thank you for creating your account with <strong>Backend Ledger</strong>.
Your registration was completed successfully.
</p>

<p>
We're happy to have you with us and hope you enjoy using our platform.
</p>

<p>
If you ever need help, simply reply to this email and we'll be happy to assist you.
</p>

<hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0;">

<p style="color:#666;">
Best regards,<br>
<strong>Backend Ledger Team</strong>
</p>

</div>

</body>
</html>
`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successfull!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};