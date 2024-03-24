import {NextFunction, Request, Response} from "express"
import { ErrorHandler } from "../utils/errorHandler"
import { SubCategoryModel } from "../models/subCategoryModel"
import { CreateSubCategoryInterface, EtpSubCategoryInterface, UpdateSubCategoryBasicInterface, UpdateSubCategoryPriceInterface } from "../interfaces/subCategoryInterface"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { findByName, removeSubCategory } from "./categoryController"
import { exportData, getData } from "./adminController"
import { GetDataInterface } from "../interfaces/adminInteface"
import { subCategoryFields } from "../headers"
import { editCartOrder, editPriceCart, updateEtpCart } from "./cartController"
import { CartModel } from "../models/cartModel"
import { OrderModel } from "../models/orderModel"
import { editRating } from "./ratingController"
import { RatingModel } from "../models/ratingModel"
import { uploadImagesMiddleware } from "../middlewares/uploadImges"
import path from 'path'
import fs from 'fs'

// Update category name 
export const updateSubCategoryRating = async (model:any, name: string, newName: string, next: NextFunction) =>{
    try {
        await model.updateMany({category: name}, {category: newName})
        return
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

interface createSubCategoryAuthenticatedInterface extends Request{
    user: {name?: string}
    body: CreateSubCategoryInterface
}

interface updateBasicAuthenticatedInterface extends Request{
    user: {name?: string}
    body: UpdateSubCategoryBasicInterface
}

interface updatePriceAuthenticatedInterface extends Request{
    user: {name?: string}
    body: UpdateSubCategoryPriceInterface
}

interface updateEtpAuthenticatedInterface extends Request{
    user: {name?: string}
    body: EtpSubCategoryInterface
}

// internal use 
export const findIdSubCat = async (id:string, next:NextFunction) => {
    try {
        const category = await SubCategoryModel.findById(id, {__v:0})
        if (!category) return next( new ErrorHandler('Sub Category does not exist', 404))
        return category
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const priceCalculation = (Input:any, sellingPrice: string, discount: string|undefined|null, gst: string|undefined|null, next: NextFunction) => {
    try {
        if (discount && gst){
            Input["discountedPrice"] = (+sellingPrice - (+discount * +sellingPrice)).toFixed(2)
            Input["gstPrice"] = (+gst * +Input["discountedPrice"]).toFixed(2)
            Input["finalPrice"] = (+Input["gstPrice"] + +Input["discountedPrice"]).toFixed(2)
        }
        else if (discount){
            Input["discountedPrice"] = (+sellingPrice - (+discount * +sellingPrice)).toFixed(2)
            Input["finalPrice"] = Input["discountedPrice"]
        }
        else if (gst){
            Input["gstPrice"] = (+gst * +sellingPrice).toFixed(2)
            Input["finalPrice"] = (+Input["gstPrice"] + +sellingPrice).toFixed(2)
        }
        else{
            Input["finalPrice"] = sellingPrice
        }
        return Input
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const validEntry = (entry:string, next: NextFunction) => {
    try {
        if (+entry > 1) return false
        if (entry.length > 6) return false
        return true
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const subCategoryCreateController = asyncErrors( async(req:createSubCategoryAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const createSubCategoryInput: CreateSubCategoryInterface = {...req.body}

    // add category id
    const category = await findByName(createSubCategoryInput.category, next)
    if (!category) return next( new ErrorHandler('Category does not exist', 404))
    createSubCategoryInput["categoryId"] =  category && category._id

    const {discount, gst, sellingPrice, ...other} = createSubCategoryInput
    
    // Valid entry for gst and discount
    if (gst && !validEntry(gst, next)) return next( new ErrorHandler('Invalid GST entry', 400))
    if (discount && !validEntry(discount, next)) return next( new ErrorHandler('Invalid Discount entry', 400))

    // add price calculations
    if (sellingPrice){
        priceCalculation(createSubCategoryInput, sellingPrice, discount, gst, next)
    }

    // add created by
    createSubCategoryInput["createdBy"] = req.user.name

    // create
    const newSubCat = new SubCategoryModel(createSubCategoryInput)

    // add in to category
    category.subCategories?.push(newSubCat._id)
    await category.save()

    // save
    await newSubCat.save()
    
    res.status(200).json({"success": true, "message": "SubCategory is created successfully", subCategory: newSubCat})
})


export const subCategoryGetAllController = asyncErrors( async(req:Request<{},{},GetDataInterface>, res:Response, next:NextFunction): Promise<void> => {
    const subCategories = await getData(req, SubCategoryModel, 'name')
    res.status(200).json({"success":true, subCategories})
})

export const subCatsGetAllController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const subCategories = await SubCategoryModel.find({}, {_id:1, name:1})
    res.status(200).json({"success":true, subCategories})
})


export const subCategoryGetOneController = asyncErrors( async(req:Request, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        res.status(200).json({"success": true, subCategory})
    }
})

export const subCategoryGetAllOfCategoryController = asyncErrors( async(req:Request, res:Response, next: NextFunction): Promise<void> => {
    const catId = req.params.catId
    const subCategory = await SubCategoryModel.find({categoryId: catId, finalPrice: {$ne: null}, etp: {$ne: null}})
    if (subCategory){
        res.status(200).json({"success": true, subCategory})
    }
})


export const subCategoryUpdateBasicController = asyncErrors( async (req:updateBasicAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        const updateBasicInput: UpdateSubCategoryBasicInterface = {...req.body}

        // if category name changes
        if (updateBasicInput.category){

            // if cat exists already - remove subCategory
            if (subCategory.category){
                await removeSubCategory(subCategory.categoryId.toString(), subCategory._id, next)
            }

            // find newCat
            const newCat = await findByName(updateBasicInput.category, next)
            if (!newCat) return next( new ErrorHandler('Category does not exist', 404))

            // set categoryId to newCat.id
            updateBasicInput["categoryId"] =  newCat && newCat._id

            // add sub category in newCat
            newCat.subCategories?.push(subCategory._id)
            await newCat.save()
        }

        const trackFields = ['category', 'name']
        const exists = trackFields.some(val => Object.keys(updateBasicInput).includes(val))
        if (exists){
            const obj = {
                category: updateBasicInput.category || subCategory.category,
                subCategory: updateBasicInput.name || subCategory.name
            }
            // changes in rating
            await editRating(RatingModel, id, obj, next)
    
            // changes in cart, changes in order
            await editCartOrder(CartModel, id, obj, next)
            await editCartOrder(OrderModel, id, obj, next) 
        }

        updateBasicInput["updatedBy"] = req.user.name
        updateBasicInput["updatedAt"] = new Date()
        const updatedSubCat = await SubCategoryModel.findByIdAndUpdate(id, updateBasicInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Sub Category has been updated successfully", subCategory: updatedSubCat})
    }
})

export const subCategoryUpdatePriceController = asyncErrors( async(req:updatePriceAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        const updatePriceInput: UpdateSubCategoryPriceInterface = {...req.body}
        let {discount, gst, sellingPrice, ...other} = updatePriceInput
        
        // Valid entry for gst and discount
        if (gst && !validEntry(gst, next)) return next( new ErrorHandler('Invalid GST entry', 400))
        if (discount && !validEntry(discount, next)) return next( new ErrorHandler('Invalid Discount entry', 400))

        // add price calculations
        if (!sellingPrice) {sellingPrice = subCategory.sellingPrice || undefined}
        if (sellingPrice){
            if (!discount) discount = subCategory.discount || undefined
            if (!gst) gst = subCategory.gst || undefined
            priceCalculation(updatePriceInput, sellingPrice, discount, gst, next)
            // make changes in products in CART
            await editPriceCart(id, updatePriceInput.finalPrice!, next)
        }
        
        updatePriceInput["updatedBy"] = req.user.name
        updatePriceInput["updatedAt"] = new Date()
        const updatedSubCat = await SubCategoryModel.findByIdAndUpdate(id, updatePriceInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Sub Category has been updated successfully", subCategory: updatedSubCat})
    }
})

export const subCategoryUpdateEtpController = asyncErrors( async(req:updateEtpAuthenticatedInterface, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        const updateEtpInput: EtpSubCategoryInterface = {...req.body}
        // Make changes in order
        // make changes in products in cart
        let oldEtp = subCategory.etp
        if (!oldEtp) oldEtp = '0'
        await updateEtpCart(id, +oldEtp, +updateEtpInput.etp, next)
        updateEtpInput["updatedBy"] = req.user.name
        updateEtpInput["updatedAt"] = new Date()
        const updatedSubCat = await SubCategoryModel.findByIdAndUpdate(id, updateEtpInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Sub Category has been updated successfully", subCategory: updatedSubCat})
    }
})

export const subCategoryHoldController = asyncErrors( async(req:Request, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        subCategory.hold = !subCategory.hold
        await subCategory.save()
        res.status(200).json({"success": true, "message": "Sub Category has been updated successfully", subCategory})
    }
})

export const subCategoryDeleteController = asyncErrors (async(req:Request, res:Response, next: NextFunction): Promise<void> => {
    const id = req.params.id
    const subCategory = await findIdSubCat(id, next)
    if (subCategory){
        // let anyone delete if there is one in cart
        await SubCategoryModel.findByIdAndDelete(id)
        res.status(200).json({"success": true, "message": "Sub Category has been deleted successfully"})
    }
})

// CSV export
export const exportDataSubCategory = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, subCategoryFields, SubCategoryModel, 'name', 'subCategories')
})
