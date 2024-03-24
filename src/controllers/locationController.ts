import {NextFunction, Request, Response} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { ChangesLocationInterface, CreateLocationInterface, UpdateLocationInterface } from "../interfaces/locationInterface"
import { LocationModel } from "../models/locationModel"
import { GetDataInterface } from "../interfaces/adminInteface"
import { exportData, getData } from "./adminController"
import { ErrorHandler } from "../utils/errorHandler"
import { locationFields } from "../headers"
const {Parser} = require("json2csv")

interface createLocationAuthenticatedInterface extends Request {
    user: {name: string}
    body: CreateLocationInterface
}

interface updateLocationAuthenticatedInterface extends Request {
    user: {name: string}
    body: UpdateLocationInterface
}

interface changesLocationAuthenticatedInterface extends Request {
    user: {name: string}
    body: ChangesLocationInterface
}

// internal use
const findId = async (id:string, next:NextFunction) => {
    try {
        const location = await LocationModel.findById(id, {password:0, __v:0})
        if (!location) return next( new ErrorHandler('Location does not exist', 404))
        return location
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const locationCreateController = asyncErrors( async(req:createLocationAuthenticatedInterface, res:Response): Promise<void> => {
    const createLocationInput: CreateLocationInterface = {...req.body}

    // add createdBy
    createLocationInput["createdBy"] = req.user.name

    // create location
    const newLocation = new LocationModel(createLocationInput)
    await newLocation.save()
    res.status(200).json({"success": true, "message": "Location has been created Successfully"})
})


export const locationGetAllController = asyncErrors( async(req:Request<{},{},GetDataInterface>, res:Response): Promise<void> => {
    const locations = await getData(req, LocationModel, 'pincode')
    res.status(200).json({"success":true, locations})
})


export const locationGetOneController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const location = await findId(id, next)
    if (location){
        res.status(200).json({"success": true, location})
    }
})

export const locationDetailsController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const {pincode} = req.body
    const location = await LocationModel.findOne({pincode})
    if (location){
        res.status(200).json({"success": true, location: {ecd: location.ecd, priceLimit: location.priceLimit, etd: location.etd}})
    }else{
        return next(new ErrorHandler('We currently do not deliver at the location', 404))
    }
})


export const locationUpdateController = asyncErrors( async(req:updateLocationAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const location = await findId(id, next)
    if (location){
        const updateLocationInput = {...req.body}
        updateLocationInput["updatedBy"] = req.user.name
        updateLocationInput["updatedAt"] = new Date()
        const updatedLocation = await LocationModel.findByIdAndUpdate(id, updateLocationInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Location has been updated successfully", location: updatedLocation})
    }
})


export const locationDeleteController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const location = await findId(id, next)
    if (location){
        await LocationModel.findByIdAndDelete(id)
        res.status(200).json({"success": true, "message": "Location has been deleted successfully"})
    }
})

export const locationChangesController = asyncErrors(async(req:changesLocationAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    // search based on are or city
    const {area, city, ...changesLocationInput} = req.body

    // define search query
    let query: {[key: string]: any} = {}

    // set query
    area ? query["area"] = area : query["city"] = city 

    // set updated by and at
    changesLocationInput["updatedBy"] = req.user.name
    changesLocationInput["updatedAt"] = new Date()

    await LocationModel.updateMany(query, changesLocationInput)
    const locations = await LocationModel.find({})
    res.status(200).json({"success":true, "message": "Changes have been saved successfully", locations})

})

// CSV export
export const exportDataLocations = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, locationFields, LocationModel, 'pincode', 'locations')
})

export const locationGetAreaController = asyncErrors( async(req:Request<{},{},GetDataInterface>, res:Response): Promise<void> => {
    const areas = await LocationModel.distinct('area')
    res.status(200).json({"success":true, areas})
})

export const locationGetCityController = asyncErrors( async(req:Request<{},{},GetDataInterface>, res:Response): Promise<void> => {
    const cities = await LocationModel.distinct('city')
    res.status(200).json({"success":true, cities})
})


export const locationPincodeController = asyncErrors( async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    const pincode = req.body.pincode
    const location = await LocationModel.findOne({pincode})
    const message = location ? "We deliver at your location" : "We do not deliver at your location"
    res.status(200).json({"success": true, "message": message})
})

