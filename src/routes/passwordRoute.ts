import express, {Request, Response} from "express"
import { forgotPassController, resetPassController, sendOTPController } from "../controllers/passwordController"
import { ForgotPassDto, ResetPassDto, sendOTPDto} from '../dto/adminDto'
import { validationMiddleware } from "../middlewares/validationDTO"
const router = express.Router()

// send OTP 
router.post('/send/OTP', validationMiddleware(sendOTPDto), sendOTPController)

// Forgot password
router.post('/forgot/pass', validationMiddleware(ForgotPassDto), forgotPassController)

// Reset password
router.post('/reset/pass', validationMiddleware(ResetPassDto), resetPassController)


export default router