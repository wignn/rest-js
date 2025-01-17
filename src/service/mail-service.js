import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import {prisma} from "../config/db.js";

export class Mailer {
  static async ForgotPassword(emailData) {
    try {
        const { email } = emailData;
        console.log(email)
        const result = await prisma.user.findUnique({
          where: { email },
        });
        if(!result){
            throw new Error("User not found");
        }
        if (result) {
          const token = nanoid(32);
          let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            },
          });
          const domain = process.env.DOMAIN
          const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to reset it.</p>
        <a href="https://frontend-for-crud.vercel.app/reset/${token}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p style="color: #888;">Thank you,<br/>Othinus</p>
      </div>
    
    `;
          const info = await transporter.sendMail({
            from: process.env.FROM,
            to: email,
            subject: "Password Reset Request",
            text: "Click the link to reset your password.",
            html: htmlBody,
          });
    
          console.log("Message sent: %s", info.messageId);
    
          await prisma.user.update({
            where: { email },
          data:{
            verifyToken: token,
            tokenCreatedAt: new Date(Date.now() + 5 * 60 * 1000),
          }
          })
        }
    return "Email sent";
      } catch (err) {
        console.log(err);
      }
    };
}
