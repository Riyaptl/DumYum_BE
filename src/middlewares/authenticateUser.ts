import { NextFunction, Request, Response } from "express";
import { asyncErrors } from "./catchAsyncErrors";
import { findIdAdmin } from "../controllers/adminController";
import { findIdCustomer } from "../controllers/customerController";
import { ErrorHandler } from "../utils/errorHandler";
const jwt = require('jsonwebtoken')

interface AuthenticatedRequest extends Request {
    user?: Object; 
}

const authenticateUser = asyncErrors(async (req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    // retrieve token
    // const token = req.cookies.jwt;
    const authorizationHeader = req.headers['authorization'];

    if (authorizationHeader === undefined || authorizationHeader === null) {
    return next(new ErrorHandler('Unauthorized: Missing Authorization Header', 401));
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        return next(new ErrorHandler('Unauthorized', 401)) 
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // get the loggedIn user
    let user
    // first check whether admin
    user = await findIdAdmin(decoded.userId, next)

    // check whether customer
    if (!user){
        user = await findIdCustomer(decoded.userId, next)
    }

    // unauthorised
    if (!user) {
        return next(new ErrorHandler('Unauthorized', 401)) 
    }

    // Attach the user
    req.user = user;
    console.log('Passed from middleware');
    next()

})

export default authenticateUser