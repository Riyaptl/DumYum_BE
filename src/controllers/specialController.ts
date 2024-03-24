import {NextFunction, Request, Response} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { GetDataInterface } from "../interfaces/adminInteface"
import { exportData, getData } from "./adminController"
import { AddSpecialInterface, CreateCategoryInterface, UpdateCategoryInterface } from "../interfaces/categoryInterface"
import { ErrorHandler } from "../utils/errorHandler"
import { categoryFields } from "../headers"
import { SpecialModel } from "../models/specialModel"
import { SubCategoryModel } from "../models/subCategoryModel"
import path from 'path'
import fs from 'fs'

interface createCategoryAuthenticatedInterface extends Request{
    user: {name?: string}
    body: CreateCategoryInterface
}

interface addSpecialAuthenticatedInterface extends Request {
    user: {name?: string}
    body: AddSpecialInterface
}

interface updateSpecialAuthenticatedInterface extends Request {
    user: {name?: string}
    body: UpdateCategoryInterface
}

interface typeSpecialAuthenticatedInterface extends Request {
    user: {name?: string}
    body: {type: string}
}

// internal use 
export const findIdSpecial = async (id:string, next:NextFunction) => {
    try {
        const special = await SpecialModel.findById(id, {__v:0})
        if (!special) return next( new ErrorHandler('Category does not exist', 404))
        return special
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const specialCreateController = asyncErrors( async (req:createCategoryAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const createCategoryInput: CreateCategoryInterface = {...req.body}

    // createdBy
    createCategoryInput["createdBy"] = req.user.name

    // new category
    const newCategory = new SpecialModel(createCategoryInput)
    await newCategory.save()
    res.status(200).json({"success":true, "message": "Category is created successfully", category: newCategory})
})

export const addSpecialController = asyncErrors( async (req:addSpecialAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const special = await findIdSpecial(id, next)
    if (special){
        const addSpecialInput: AddSpecialInterface = {...req.body}
        // Whether valid ids
        const subCategories = await SubCategoryModel.find().select('_id')
        let validIds: string[] = []
        subCategories.forEach(subCat => validIds.push(subCat.id.toString()))
        addSpecialInput.subCategories.forEach(id => {
            if (validIds.indexOf(id) === -1){
                return res.status(400).json({"success": true, "message": "Invalid entry"}) 
            } 
        })
        addSpecialInput["updatedBy"] = req.user.name
        addSpecialInput["updatedAt"] = new Date()
        const updatedSpecial = await SpecialModel.findByIdAndUpdate(id, addSpecialInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Category has been updated successfully", category: updatedSpecial})
    }
})

export const specialGetAllController = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next:NextFunction): Promise<void> => {
    const specials = await getData(req, SpecialModel, 'name')
    res.status(200).json({"success":true, specials})
})

export const specialGetOneController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const special = await findIdSpecial(id, next)
    if (special){
        res.status(200).json({"success": true, special})
    }
})

export const specialGetAnimationController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const specials = await SpecialModel.find({type:"animation", images:{$ne: []}}, {_id:1, name:1, images:1, tagline:1, description:1})
    res.status(200).json({"success":true, specials})
})

export const specialGetSubCatController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const category = await SpecialModel.findById(id, {__v:0})
                    .populate({
                        path: "subCategories",
                        select: "-id ",
                        match: {finalPrice: {$ne: null}}
                    })
    if (!category) return next( new ErrorHandler('Category does not exist', 404))
    if (category){
        res.status(200).json({"success": true, special:category})
    }
})


export const specialUpdateController = asyncErrors( async(req:updateSpecialAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const special = await findIdSpecial(id, next)
    if (special){
        const updateSpecialInput: UpdateCategoryInterface = {...req.body}
        updateSpecialInput["updatedBy"] = req.user.name
        updateSpecialInput["updatedAt"] = new Date()
        const updatedSpecial = await SpecialModel.findByIdAndUpdate(id, updateSpecialInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Category has been updated successfully", special: updatedSpecial})
    }
})

export const specialTypeController = asyncErrors( async(req:typeSpecialAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const special = await findIdSpecial(id, next)
    if (special){
        if (special.type === req.body.type) {
            res.status(200).json({"success": true, "message": "Type is same", special}) 
        }else{
            const typeSpecialInput:any = {...req.body}
            typeSpecialInput["updatedBy"] = req.user.name
            typeSpecialInput["updatedAt"] = new Date()
            const typeUpdatedSpecial = await SpecialModel.findByIdAndUpdate(id, typeSpecialInput, {new: true, projection: {__v:0}})
            res.status(200).json({"success": true, "message": "Category has been updated successfully", special: typeUpdatedSpecial})
        }
    }
})


export const specialDeleteController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const special = await findIdSpecial(id, next)
    if (special){
        await SpecialModel.findByIdAndDelete(id)
        res.status(200).json({"success": true, "message": "Category has been deleted successfully"})
    }
})

// CSV export
export const exportDataCategory = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, categoryFields, SpecialModel, 'name', 'specialCategories')
})



