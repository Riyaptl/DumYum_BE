import { NextFunction, Request, Response } from "express";
import { ResetPassInterface } from "../interfaces/adminInteface";
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { ErrorHandler } from "../utils/errorHandler";
import { AdminModel } from "../models/adminModel";
import { CustomerModel } from "../models/customerModel";
const bcrypt = require("bcrypt");

export interface ResetPassAuthenticatedInterface extends Request {
    user: {password: string, save: () => {}};
    body: ResetPassInterface
}


// Reset password 
export const resetPassController = asyncErrors( async (req:ResetPassAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> =>{
    const {oldPassword, newPassword, confirmPassword} = req.body
  
    // old password valid or not
    const valid = await bcrypt.compare(oldPassword, req.user.password)
    if (!valid) return next(new ErrorHandler('Invalid password', 400))

    // new and confirm password match
    if (newPassword !== confirmPassword) return next(new ErrorHandler('Passwords do not match', 400))

    // set new password
    req.user.password = newPassword
    await req.user.save()
    res.status(200).json({"success": true, "message": "New password has been set successfully"})
})


// Forgot password
// send otp
export const sendOTPController = asyncErrors( async (req:any, res:Response, next: NextFunction): Promise<void> =>{
    const {email} = req.body
    let userExists = await AdminModel.findOne({email});
    if (!userExists) {
        userExists = await CustomerModel.findOne({email});
    }
    if (!userExists) {
        return next(new ErrorHandler('User not found', 404))
    }

    const OTP = Math.floor(Math.random() * 900000) + 100000;
    console.log(OTP)
    const message = `\nThank you for signing up with our platform. To complete your account verification, please use the following One-Time Password (OTP):\n\n OTP: ${OTP}\n\n Please enter this OTP in the designated field on our website to verify your account. Please note that this OTP is valid for a 10 miniutes only.\nIf you did not sign up for an account or have any concerns, please disregard this email.
      n\nThank you,\nDumYum`;

    const mailOptions = {
        email,
        subject: 'One-Time Password (OTP) Verification',
        // html:`<h1>Hello, this is a test email!</h1>
        // <p>This is the content of the email.</p>`,
        text: message,
    };
    // await this.emailsService.sendEmail(mailOptions);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(OTP.toString(), salt);
    await AdminModel.findOneAndUpdate(
        { email },
        {
            $set: { otp: hash, otpGenerated: Date.now() },
        },
        { new: true },
    );
    res.status(200).json({"success": true, "message": "OTP has been sent successfully"})
})

// verify otp
export const forgotPassController = asyncErrors( async (req:any, res:Response, next: NextFunction): Promise<void> =>{
    
    const {otp, email, newPassword, confirmPassword} = req.body
    let user = await AdminModel.findOne({email})
    if (!user) {
        user = await CustomerModel.findOne({email});
    }
    if (!user) {
        return next(new ErrorHandler('User not found', 404))
    }

    // Check if OTP has expired
    if (user.otpGeneratedAt && (Date.now() - new Date(user.otpGeneratedAt).getTime()) / 60000 > 10) {
        return next(new ErrorHandler('OTP Expired', 401))
    }

      // If correct OTP
    if (!(await bcrypt.compare(otp, user.otp?.toString()))) {
        return next(new ErrorHandler('Invalid OTP. Please double-check the code you entered and try again.', 401))
    }

      // If both the passwords are matching
    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler(`Passwords don't match`, 401))
    }

      // Save user
    user.password = newPassword;
    await user.save();

    res.status(200).json({"success": true, "message": "Password has been updated successfully"})
})