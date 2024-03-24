
import { Router } from "express";
const router = Router()
import {checkEmailController, signInController, signOutController, signUpController} from "../controllers/authController"
import { validationMiddleware } from "../middlewares/validationDTO";
import { CheckEmailDto, CreateCustomerDto } from "../dto/customerDto";
import { SignInDto } from "../dto/authDto";

// check email 
router.post('/email', validationMiddleware(CheckEmailDto), checkEmailController)

// signUp
router.post('/signup', validationMiddleware(CreateCustomerDto), signUpController)

// signIn
router.post('/signin', validationMiddleware(SignInDto), signInController)

// signout
router.post('/signout', signOutController)

export default router