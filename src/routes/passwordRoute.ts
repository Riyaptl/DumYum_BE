import express, {Request, Response} from "express"
import { forgotPassController, resetPassController, sendOTPController } from "../controllers/passwordController"
import { ForgotPassDto, ResetPassDto, sendOTPDto} from '../dto/adminDto'
import { validationMiddleware } from "../middlewares/validationDTO"
import authenticateUser from "../middlewares/authenticateUser"
const router = express.Router()

// send OTP 
router.post('/send/OTP', validationMiddleware(sendOTPDto), sendOTPController)

// Forgot password
router.post('/forgot/pass', validationMiddleware(ForgotPassDto), forgotPassController)

// Apply authentication middleware
router.use(authenticateUser)

// Reset password
router.post('/reset/pass', validationMiddleware(ResetPassDto), resetPassController)


export default router