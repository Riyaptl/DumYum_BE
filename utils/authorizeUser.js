"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("./errorHandler");
const authorizeUser = (roles) => {
    return (req, res, next) => {
        var _a;
        if (req.user && roles.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            next();
        }
        else {
            return next(new errorHandler_1.ErrorHandler('Unauthorized', 401));
        }
    };
};
exports.default = authorizeUser;
