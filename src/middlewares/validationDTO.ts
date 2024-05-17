// src/middleware/validation.middleware.js

import { Response , Request, NextFunction} from "express";
import { ErrorHandler } from "../utils/errorHandler";

const { validate } = require('class-validator');
const { plainToClass } = require('class-transformer');

export const validationMiddleware = (dtoClass: Object) => {
  return async (req:Request, res:Response, next: NextFunction) => {
    const dtoInstance = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessage = errors.map((error:any) => {
        try {
          Object.values(error.constraints)    
        } catch (error) {
          return next(new ErrorHandler('Validation error', 400))
        }
      })
      if (errorMessage[0] != undefined){
        return res.status(400).json({ message: errorMessage.join(',') });
      }
    }

    req.body = dtoInstance;
    next();
  };
};

