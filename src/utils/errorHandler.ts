
class ErrorHandler extends Error {
    statusCode
    constructor(message:string, statusCode:number){
        console.log(message, statusCode);
        super(message)
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}

export {ErrorHandler}