import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@coldmailer.com",
    to,
    subject,
    html,
    attachments,
  });

  console.log(`Email sent: ${info.messageId}`);
  return info;
};

export const compileTemplate = (template, variables) => {
  let compiled = template.body;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    compiled = compiled.replace(regex, value);
  }

  return compiled;
};

export const compileSubject = (subject, variables) => {
  let compiled = subject;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    compiled = compiled.replace(regex, value);
  }

  return compiled;
};
