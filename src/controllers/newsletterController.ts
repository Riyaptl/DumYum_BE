import { NextFunction, Response, Request } from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { sendEmail } from "../utils/sendEmail"
import { ErrorHandler } from "../utils/errorHandler"

interface newsletterAuthenticatedInterface extends Request {
    body: {email: string}
}


export const newsletterController = asyncErrors( async (req:newsletterAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {

    const {email} = req.body
    
    if (!email){
        return next(new ErrorHandler('Invalid Entry', 400))
    }

    const message = `\nI wanted to inform you that a new customer has subscribed to our newsletter using the email address: ${email}.\nThank you,\nDumYum`;

    const mailOptions = {
        email: process.env.email,
        subject: 'Newsletter Inquiry',
        text: message,
    };

    try {
        await sendEmail(mailOptions)
        res.status(200).json({"success": true, "message": "You have been registered successfully."})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
    
})