import {NextFunction, Request, Response} from "express"
import {asyncErrors} from "../middlewares/catchAsyncErrors"
import { AdminModel } from "../models/adminModel"
import { ErrorHandler } from "../utils/errorHandler"
import {addminFields} from '../headers'
import { CreateAdminInterface, GetDataInterface, UpdateAdminInterface, ResetPassInterface } from "../interfaces/adminInteface"
const bcrypt = require("bcrypt");
const {Parser} = require("json2csv")

// validate email
export const validateEmail = (email:string) => {
    var regex = /\b[A-Za-z0-9._%+-]+@(?:gmail|yahoo)\.com\b/;
    return regex.test(email);
}

// Extend the Request type to include the 'user' property
interface CreateAdminAuthenticatedInterface extends Request {
    user: { name: string }; 
    body: CreateAdminInterface
}

interface UpdateAdminAuthenticatedInterface extends Request {
    user: { name: string }; 
    body: UpdateAdminInterface
}

export interface ResetPassAuthenticatedInterface extends Request {
    user: {password: string, save: () => {}};
    body: ResetPassInterface
}


// get single admin by id - authentication
export const findIdAdmin = async (id:string, next:NextFunction) => {
    try {
        const admin = await AdminModel.findById(id)
        return admin
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

// internal use
const findId = async (id:string, next:NextFunction) => {
    try {
        const admin = await AdminModel.findById(id, {password:0, __v:0})
        if (!admin) return next( new ErrorHandler('Admin does not exist', 404))
        return admin
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

// get single admin by email
export const findEmailAdmin = async (email:string, next:NextFunction) => {
   try {
        const admin = await AdminModel.findOne({email})
        return admin
   } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
   }
}

// Create admin
export const adminCreateController = asyncErrors( async (req:CreateAdminAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const createAdminInput = {...req.body}
    
    // validate email
    if (!validateEmail(createAdminInput.email)) return next(new ErrorHandler('Invalid Email Id', 400))
    
    // add created by
    createAdminInput["createdBy"] = req.user.name

    // create newAdmin
    const newAdmin = new AdminModel(createAdminInput)
    await newAdmin.save()

    // return without password
    const {password, __v, ...admin} = newAdmin.toObject()
    res.status(200).json({"success": true, "message": "Admin is created successfully", admin})
})


// get data 
export const getData = async (req: Request<{},{},GetDataInterface>, model:any, param: string ) => {
    try {
        // Define query
        let query: { [key: string]: any} = {}
        
        // If "value" is passed for search
        if (req.body.value){
            query[param] = {"$regex": req.body.value, "$options": "i"}
        }

        // Get all data
        const data = await model.find(query, {password:0, __v:0}).sort({createdAt: -1})
        return data
    } catch (error) {
        return error
    }
}

// Get all admins with search based on name
export const adminGetAllController = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response): Promise<void> => {

    // Get all admins
    const admins = await getData(req, AdminModel, 'name')
    res.status(200).json({"success": true, admins})
})

export const adminGetOneController = asyncErrors( async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const admin = await findId(id, next)
    if (admin){
        res.status(200).json({"success": true, admin})
    }
})

export const adminUpdateController = asyncErrors(async (req:UpdateAdminAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {
    // if admin exists
    const id = req.params.id
    const admin = await findId(id, next)
    if (admin){
        const updateAdminInput = {...req.body}
        
        // validate email
        if (updateAdminInput.email && !validateEmail(updateAdminInput.email)) return next(new ErrorHandler('Invalid Email Id', 400))
        
        // add updated by and at
        updateAdminInput["updatedBy"] = req.user.name
        updateAdminInput["updatedAt"] = new Date()
        const updatedAdmin = await AdminModel.findByIdAndUpdate(admin?._id, updateAdminInput, {new: true, projection: {password:0, __v:0}})
        res.status(200).json({"success": true, "message": "Admin has been updated successfully", admin: updatedAdmin})
    }
})

export const adminDeleteController = asyncErrors( async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const admin = await findId(id, next)
    if (admin){
        await AdminModel.findByIdAndDelete(admin?._id)
        res.status(200).json({"success": true, "message": "Admin has been deleted successfully"})
    }
})

// CSV export

export const exportData = async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction, header: string[], model: any, param: string, filename: string)  => {
    try {
        const data = await getData(req, model, param) || []

        const fields = header

        const parser = new Parser({
            fields
        })

        const json: Array<Object> = []
        for (const singleData of data as Array<{[key: string]: any}>) {
            let singleDataObj: any = {}
            for (let index = 0; index < fields.length; index++) {
                singleDataObj[fields[index]] = singleData[fields[index][0].toLowerCase()+fields[index].substring(1)] || null          
            }
            json.push({...singleDataObj})
            
        }

        const csv = parser.parse(json)
        res.header('Content-Type', 'text/csv')
        res.attachment(`${filename}.csv`)
        return res.send(csv)
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const exportDataAdmins = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, addminFields, AdminModel, 'name', 'admins')
})

    