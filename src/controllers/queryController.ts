import {NextFunction, Request, Response} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { CreateQueryInterface } from "../interfaces/queryInterface"
import { QueryModel } from "../models/queryModel"
import { GetDataInterface } from "../interfaces/adminInteface"
import { exportData, getData } from "./adminController"
import { ErrorHandler } from "../utils/errorHandler"
import { queryFields } from "../headers"
import { constants } from "buffer"
import { findIdCustomer } from "./customerController"
import path from "path"
import fs from 'fs';
const {DateTime} = require('luxon')

// Extend request to add "user"
interface createQueryAuthenticatedInterface extends Request{
    user: {_id: string, name: string, email: string, phone: string,  queryHistory: string[], queryStatus: string, save: () => {}}
    body: CreateQueryInterface
}

interface getQueryAuthenticatedInterface extends Request{
    user: {_id: string, role: string}
    body: GetDataInterface
}

interface closeQueryAutenticatedInterface extends Request{
    user: {name: string}
    params: {id: string}
}

// Update customer name, email, phone
export const updateQuery = async (id: string, updateQueryInput:{[key: string]: any}, next:NextFunction) => {
    try {
        await QueryModel.updateMany({customerId: id}, updateQueryInput)
        return
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}



// internal use
const findId = async (id:string, req:any, next:NextFunction) => {
    try {
        let query: {[key: string]: any} = {_id: id}
        
        if (req.user.role === 'customer') {
            query["customerId"] = req.user._id
        }
        const data = await QueryModel.findOne(query, {__v:0})
        if (!data) return next( new ErrorHandler('Query does not exist', 404))
        return data
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

const getQueryData = async (req: getQueryAuthenticatedInterface, model:any, param: string ) => {
    try {
        // Define query
        let query: { [key: string]: any} = {}

        if (req.user.role === 'customer') {
            query["customerId"] = req.user._id
        }
        
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

// get last sequence
export const squence = async (model: any) => {
    try {
        // Get the current date in the 'Asia/Kolkata' timezone
        const todayStart = DateTime.now().setZone('Asia/Kolkata').startOf('day').toJSDate();
        const todayEnd = DateTime.now().setZone('Asia/Kolkata').endOf('day').toJSDate();

        const data = await model.find({
                            createdAt: {
                                $gte: todayStart,
                                $lt: todayEnd
                            }
                        });
        return data[data.length - 1]

    } catch (error) {
      throw error
    }
}


export const queryCreateController = asyncErrors( async (req:createQueryAuthenticatedInterface, res:Response): Promise<void> => {
    const createQueryInput:CreateQueryInterface = {...req.body}

    // create queryId
    const lastQuery = await squence(QueryModel)
    let seq
    if (lastQuery){
        seq = `${+lastQuery.seq + 1}`
    }else{
        seq = '1'
    }
    const todayInIST = DateTime.now().setZone('Asia/Kolkata').toLocaleString(DateTime.DATE_SHORT);;
    const queryId = todayInIST+'_QRI_'+seq 
    createQueryInput["queryId"] = queryId
    createQueryInput["seq"] = seq
    
    // add customer info
    createQueryInput["customerId"] = req.user._id
    createQueryInput["name"] = req.user.name
    createQueryInput["email"] = req.user.email
    createQueryInput["phone"] = req.user.phone 

    // create query  
    const newQuery = new QueryModel(createQueryInput)

    // add to customer creating it
    req.user.queryHistory.push(newQuery._id)
    req.user.queryStatus = 'active'
   
    // save
    await req.user.save()
    await newQuery.save()

    res.status(200).json({"success":true, "message": "Query is raised successfully", query: newQuery})
})


export const queryGetAllCustController = asyncErrors ( async (req:getQueryAuthenticatedInterface, res:Response): Promise<void> => {
    const customerId = req.user._id
    const queries = await QueryModel.find({customerId}).select({title:1, queryStatus:1, createdAt:1, description:1, closedAt:1})
    res.status(200).json({"success":true, queries})
})

export const queryGetAllController = asyncErrors ( async (req:getQueryAuthenticatedInterface, res:Response): Promise<void> => {
    const queries = await getQueryData(req, QueryModel, 'queryId')
    res.status(200).json({"success":true, queries})
})


export const queryGetOneController = asyncErrors (async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const query = await findId(id, req, next)
    if (query){
        res.status(200).json({"success":true, query})
    }
})


export const queryCloseController = asyncErrors (async (req:closeQueryAutenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const query = await findId(id, req, next)
    if (query){
        
        // change queryStatus in customer
        const customer = await findIdCustomer(query.customerId.toString(), next)
        if (customer) {
            customer.queryStatus = 'inactive'
            await customer.save()
        }

        query.queryStatus = 'inactive'
        query.closedAt = new Date()
        query.closedBy = req.user.name

        await query.save()
        res.status(200).json({"success":true, "message": "Query has been closed successfully query", query})
    }
})


export const queryDeleteController = asyncErrors (async (req:closeQueryAutenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const query = await findId(id, req, next)
    if (query){
        if (query.queryStatus === 'active') return next(new ErrorHandler('Quaery is active', 400))
        await QueryModel.findByIdAndDelete(id)
        res.status(200).json({"success":true, "message": "Query has been deleted successfully"})
    }
})

// CSV export
export const exportDataQueries = asyncErrors( async (req:getQueryAuthenticatedInterface, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, queryFields, QueryModel, 'queryId', 'queries')
})

export const queryUploadImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const query = await findId(id, req, next)
    if (query) {
        const filenames = req.files.map((file: Express.Multer.File) => file.filename);
        for (const filename of filenames){
            if (query.images?.indexOf(filename) === -1) query.images?.push(filename)
        }
        await query.save();
        res.status(200).json({ success: true, message: 'Images uploaded successfully'});
    }
})

export const queryViewImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const query = await findId(id, req, next)
    if (query) {
        // if (query.images!.length === 0) return res.status(404).json({ success: false, message: 'No images found for this query' });

        // Generate array of image URLs
        const imageUrls: string[] = [];
        for (const filename of query.images!) {
            const imageUrl = `/uploads/query/${filename}`; 
            imageUrls.push(imageUrl);
        }

        // Send the image URLs as response
        return res.status(200).json({ success: true, images: imageUrls });
    }
})


export const queryViewImagesCustController = asyncErrors( async(req:any, res:Response) => {
    const id = req.params.id
    const customerId = req.user._id
    const query = await QueryModel.findOne({_id:id, customerId})
    if (query) {
        // if (query.images!.length === 0) return res.status(404).json({ success: false, message: 'No images found for this query' });

        // Generate array of image URLs
        const imageUrls: string[] = [];
        for (const filename of query.images!) {
            const imageUrl = `/uploads/query/${filename}`; 
            imageUrls.push(imageUrl);
        }

        // Send the image URLs as response
        return res.status(200).json({ success: true, images: imageUrls });
    }
})


