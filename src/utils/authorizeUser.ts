import { NextFunction, Request, Response } from "express"
import { ErrorHandler } from "./errorHandler"


const authorizeUser = (roles:string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if ((req as any).user && roles.includes((req as any).user?.role)){
            next()
        }
        else{
            return next(new ErrorHandler('Unauthorized', 401)) 
        }
    }
}

export default authorizeUser