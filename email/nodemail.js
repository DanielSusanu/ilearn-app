const configEmail = require('../config/email.json');
const nodemailer = require('nodemailer');

const sendEmail = async emailContent => {
  // Generate test SMTP service account from ethereal.email

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(configEmail.transporter);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"${configEmail.fromname}" ${configEmail.fromemail}`, // sender address
    to: emailContent.to, // list of receivers
    subject: emailContent.subject, // Subject line
    text: emailContent.text, // plain text body
    html: emailContent.html // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

module.exports = sendEmail;
