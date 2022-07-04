const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  //Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //Activate the "less secure app" in gmail option for using gmail
  });
  //Define the email options
  const mailOptions = {
    from: 'Fazliddin Vakhobov <registermail.trash@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};
