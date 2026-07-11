import nodemailer from "nodemailer";

export class Transporter {
    static transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "locdz8c@gmail.com",
            pass: process.env.SMTP_PASS || "0983310337"
        }
    })
}