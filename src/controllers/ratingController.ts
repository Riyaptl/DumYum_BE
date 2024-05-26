import {NextFunction, Request, Response} from "express"
import {asyncErrors} from "../middlewares/catchAsyncErrors"
import { AdminModel } from "../models/adminModel"
import { ErrorHandler } from "../utils/errorHandler"
import {addminFields, ratingFields} from '../headers'
import {isEmail} from 'validator'
import { CreateAdminInterface, GetDataInterface, UpdateAdminInterface, ResetPassInterface } from "../interfaces/adminInteface"
import { CreateRatingInterface, Review } from "../interfaces/ratingInterface"
import { RatingModel } from "../models/ratingModel"
import { findIdSubCat } from "./subCategoryController"
import { exportData, getData } from "./adminController"
const bcrypt = require("bcrypt");
const {Parser} = require("json2csv")

// Extend the Request type to include the 'user' property
interface CreateRatingAuthenticatedInterface extends Request {
    user: { name: string }; 
    body: CreateRatingInterface
}
// used in subCategory
export const editRating = async (model: any, subCategoryId: string, newObj: {[key: string]: any}, next:NextFunction) => {
    try {
        await model.updateMany({subCategoryId}, newObj)
    } catch (error) {
        next(new ErrorHandler('Internal Server Error', 500))
    }
}

// Get all ratings
export const ratingGetAllController = asyncErrors( async (req:Request<{}, {}, GetDataInterface>, res:Response, next:NextFunction): Promise<void> => {
    const ratings = await getData(req, RatingModel, 'subCategory')
    res.status(200).json({"success": true, ratings})
})

// Get single rating details
export const ratingGetIdController = asyncErrors( async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const rating = await RatingModel.findById(id)
    if (!rating) return next (new ErrorHandler('Rating not found', 400))
    const details = rating.review
    res.status(200).json({"success": true, ratingDetails:details})
})

// Create rating
export const ratingCreateController = asyncErrors( async (req:CreateRatingAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const {subCategoryId, review} = req.body
    
    // if subCategory does not exists - create one
    let ratingObj = await RatingModel.findOne({subCategoryId})
    if (!ratingObj) {
        const subCategory = await findIdSubCat(subCategoryId.toString(), next)
        if (!subCategory){
            return next(new ErrorHandler('Sub Category does not exists', 404))
        }
        const name = subCategory && subCategory.name
        if (subCategory.category){
            ratingObj = new RatingModel({subCategoryId, subCategory: name, category: subCategory.category})
        }else if (subCategory.special){
            ratingObj = new RatingModel({subCategoryId, subCategory: name, special: subCategory.special})
        }else{
            return next(new ErrorHandler('Invalid entry', 400))
        }
    }

    // add into respective ratingObj
    let newReview: Review = {
        title: review.title,
        rating: review.rating,
        description: review.description,
        customer: req.user.name,
        createdAt: new Date()
    }
    ratingObj.review.push(newReview)

    // get overall rating
    if (!ratingObj.rating) ratingObj.rating = newReview.rating
    else{
        ratingObj.rating = (((+ratingObj.rating*(ratingObj.review.length-1)) + +newReview.rating) / ratingObj.review.length).toFixed(1)
    }

    await ratingObj.save()
    res.status(200).json({"success": true, "message": "Review is created successfully", rating: ratingObj})
})

// Get ratings of subCategory
export const ratingGetController = asyncErrors( async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    const {subCategoryId} = req.body
    const rating = await RatingModel.findOne({subCategoryId})
    // pass empty rating if not found
    res.status(200).json({"success": true, rating})
})


// csv export
export const exportDataRatings = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, ratingFields, RatingModel, 'subCategory', 'ratings')
})



