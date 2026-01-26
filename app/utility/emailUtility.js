
import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_SECURITY, EMAIL_USER } from "../config/config.js";

const SendEmail = async (EmailTo, EmailSubject, EmailText) => {
    try {
        // Create the transporter
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_SECURITY, // Use true for 465, false for 587
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // For self-signed certificates or dev environments
            },
        });

        // Email options
        const mailOptions = {
            from: 'Portfolio MERN <reacttemplatebuilder@gmail.com>',
            to: EmailTo,
            subject: EmailSubject,
            text: EmailText,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Email sending failed. Please check the SMTP configuration.");
    }
};

export default SendEmail;
