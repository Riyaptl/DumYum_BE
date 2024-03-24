// src/middleware/validation.middleware.js

import { Response , Request, NextFunction} from "express";

const { validate } = require('class-validator');
const { plainToClass } = require('class-transformer');

export const validationMiddleware = (dtoClass: Object) => {
  return async (req:Request, res:Response, next: NextFunction) => {
    const dtoInstance = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessage = errors.map((error:any) => Object.values(error.constraints)).join(', ');
      return res.status(400).json({ message: errorMessage });
    }

    req.body = dtoInstance;
    next();
  };
};

