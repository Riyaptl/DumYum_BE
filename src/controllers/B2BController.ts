import { NextFunction, Response, Request } from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { sendEmail } from "../utils/sendEmail"
import { ErrorHandler } from "../utils/errorHandler"

interface B2BConnectAuthenticatedInterface extends Request {
    body: {email: string, businessName:string, phone: string, reason: string}
}


export const B2BConnectController = asyncErrors( async (req:B2BConnectAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {

    const {businessName, phone, email, reason} = req.body
    
    if (!email || !businessName || !phone || !reason){
        return next(new ErrorHandler('Invalid Entry', 400))
    }

    const message = `\nI wanted to inform you that a new customer has connected us via our B2B Connect using the email address: ${email}.\nName of Business: ${businessName}.\nMobile No.: ${phone}.\nEmail Id: ${email}.\nReason To Connect: ${reason}.\n\nThank you,\nDumYum`;
    
    const mailOptions = {
        email: process.env.email,
        subject: 'B2B Connect Inquiry',
        text: message,
    };

    try {
        await sendEmail(mailOptions)
        res.status(200).json({"success": true, "message": "Thank you for reaching us. We will connect with you shortly."})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
    
})