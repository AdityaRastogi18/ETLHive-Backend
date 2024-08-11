import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

interface MailOptions {
  to: string;
  subject: string;
  templateName: string;
  context: Record<string, any>;
}

const transporter = nodemailer.createTransport({
  service: "gmail", // e.g., 'gmail'
  secure: true,
  port: 465,
  auth: {
    user: "aditya.rastogi.880@gmail.com",
    pass: "wpvadckeecubtcwx",
  },
});

export const sendMail = async ({
  to,
  subject,
  templateName,
  context,
}: MailOptions) => {
  const templatePath = path.resolve(
    __dirname,
    "../templates",
    `${templateName}.html`
  );
  console.log("template path", templatePath);
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(context);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlToSend,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Could not send email.");
  }
};
