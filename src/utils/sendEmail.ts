const nodeMailer = require("nodemailer")

export const sendEmail = async (options: any) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth:{
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.text
    }

    // For password -> go to myaccount.google.com of process.env.SMTP_MAIL -> security -> 2 step verification and turn it on -> app passwords  -> In the Select app option, choose Other (custom name) and give it nodemailer and click on Generate. A 16-digit password will be shown once -> pass it to process.env.SMTP_PASSWORD 

    await transporter.sendMail(mailOptions)

}
