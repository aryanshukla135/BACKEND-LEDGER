require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
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
  const info = await transporter.sendMail({
    from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  return info;
};

 async function sendRegistrationEmail(userEmail, name){
    const subject = 'Welcome to Backend Ledger!';   
    const text = `Hi ${name}, welcome to Backend Ledger! We're excited to have you on board.`;
    const html = `<p>Hi <strong>${name}</strong>, welcome to Backend Ledger!</p><p>We're excited to have you on board.</p>`;

    await sendEmail(userEmail, subject, text, html);
 }  

 async function sendTransactionEmail(userEmail,name,amount,toAccount,fromAccount){
    const subject = 'Transaction Notification';
    const text = `Hi ${name}, a transaction of amount ${amount} has been made from account ${fromAccount} to account ${toAccount}.`;
    const html = `<p>Hi <strong>${name}</strong>,</p><p>A transaction of amount <strong>${amount}</strong> has been made from account <strong>${fromAccount}</strong> to account <strong>${toAccount}</strong>.</p>`;

    await sendEmail(userEmail, subject, text, html);

 }

 async function sendTransactionFailureEmail(userEmail,name,amount,toAccount){
    const subject = 'Transaction Failure Notification';   
    const text = `Hi ${name}, a transaction of amount ${amount} has failed to be made to account ${toAccount}.`;
    const html = `<p>Hi <strong>${name}</strong>,</p><p>A transaction of amount <strong>${amount}</strong> has failed to be made to account <strong>${toAccount}</strong>.</p>`;
    await sendEmail(userEmail, subject, text, html);
 }
module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
}