import { NextFunction, Request, Response } from "express";

const allowed = ['https://dumyum.netlify.app/'];

const credentials = (req:Request, res:Response, next:NextFunction) => {
    const origin = req.headers.origin || ''
    if (allowed.includes(origin)){
        res.header('Access-Control-Allow-Credentials', 'true')
    }
    next()
}

export default credentials;


