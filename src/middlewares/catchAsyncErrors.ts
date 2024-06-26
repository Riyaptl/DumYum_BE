import { Response, Request, NextFunction } from "express";

const asyncErrors = (func: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export { asyncErrors };
