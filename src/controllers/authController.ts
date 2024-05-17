import {NextFunction, Request, Response} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors";
import { createCustomerAuthenticatedDto, customerCreateController, findEmailCustomer } from "./customerController";
import { findEmailAdmin, validateEmail } from "./adminController";
import { ErrorHandler } from "../utils/errorHandler";
import { CustomerModel } from "../models/customerModel";
import { AdminModel } from "../models/adminModel";
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

export const checkEmailController = asyncErrors( async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    const {email} = req.body
    
    // validate email
    if (!validateEmail(email)) return next(new ErrorHandler('Invalid Email Id', 400)) 

    //  if already exists
    const customer = await CustomerModel.findOne({email})
    if (customer) return next(new ErrorHandler('Email Id exists already', 400)) 

    const admin = await AdminModel.findOne({email})
    if (admin) return next(new ErrorHandler('Email Id exists already', 400)) 

    
    res.status(200).json({"success": true, "message": "Email Id check passed"})
})

export const signUpController = asyncErrors( async (req:createCustomerAuthenticatedDto, res:Response, next: NextFunction): Promise<void> => {    
    // customers only
    // when signup - create customer
    const userId = await customerCreateController(req, res, next)
    
    if(userId){
        // create access token
        const payload = {userId}
        const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_VALID
        })

        // res.cookie('jwt', accessToken, {httpOnly:true, maxAge: 30*24*60*60*1000})
        res.status(200).json({"success": true, "message": "Welcome onboard!!",accessToken, role: "customer"})
    }
})


export const signInController = asyncErrors( async (req:Request, res:Response, next: NextFunction): Promise<void> => {

    let user: any
    // first check whether admin
    user = await findEmailAdmin(req.body.email, next)

    // check whether customer
    if (!user){
        user = await findEmailCustomer(req.body.email, next)
    }
    if (!user) {
        return next(new ErrorHandler('Invalid credentials', 400)) 
    }

    // valid password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return next(new ErrorHandler('Invalid credentials', 400)) 

    // create access token
    const payload = {userId: user._id}
    const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_VALID
    })

    // res.cookie('jwt', accessToken, {httpOnly:true, maxAge: 30*24*60*60*1000})
    res.status(200).json({"success": true, "message": "Welcome back!!", role: user.role, accessToken})
})

export const signOutController = asyncErrors( async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    // clear cookie
    res.clearCookie('jwt')
    res.status(200).json({"success": true, "message": "Logged out successfully"})
})