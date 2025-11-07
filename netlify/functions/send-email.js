import nodemailer from 'nodemailer';

export async function handler(event) {
  const { to, subject, message } = JSON.parse(event.body);

  const transporter = nodemailer.createTransport({
    host: 'smtp.protonmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Variasjon" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: message
    });
    return {
      statusCode: 200,
      body: 'E-post sendt'
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Feil: ' + err.message
    };
  }
}
