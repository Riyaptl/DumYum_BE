import {NextFunction, Request, Response} from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { GetDataInterface } from "../interfaces/adminInteface"
import { exportData, getData } from "./adminController"
import { CreateCategoryInterface, UpdateCategoryInterface } from "../interfaces/categoryInterface"
import { CategoryModel } from "../models/categoryModel"
import { ErrorHandler } from "../utils/errorHandler"
import { categoryFields } from "../headers"
import { updateSubCategoryRating } from "./subCategoryController"
import { updateCartOrder } from "./cartController"
import { CartModel } from "../models/cartModel"
import { OrderModel } from "../models/orderModel"
import { SubCategoryModel } from "../models/subCategoryModel"
import { RatingModel } from "../models/ratingModel"
import path from 'path'
import fs from 'fs';

interface createCategoryAuthenticatedInterface extends Request{
    user: {name?: string}
    body: CreateCategoryInterface
}

interface updateCategoryAuthenticatedInterface extends Request {
    user: {name?: string}
    body: UpdateCategoryInterface
}

// find by name - subCategory
export const findByName = async (name:string, next:NextFunction) => {
    try {
        const category = await CategoryModel.findOne({name}, {__v:0})
        return category
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

// internal use 
export const findIdCategory = async (id:string, next:NextFunction) => {
    try {
        const category = await CategoryModel.findById(id, {__v:0})
        if (!category) return next( new ErrorHandler('Category does not exist', 404))
        return category
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const removeSubCategory = async (id: string, subCatId: string, next: NextFunction) => {
    try {
        const oldCat = await CategoryModel.findById(id)
        if (!oldCat) return next( new ErrorHandler('Category does not exist', 404))
        oldCat.subCategories = oldCat.subCategories?.filter(id => id.toString() != subCatId.toString())
        await oldCat.save()
        return
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const categoryCreateController = asyncErrors( async (req:createCategoryAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const createCategoryInput: CreateCategoryInterface = {...req.body}

    // createdBy
    createCategoryInput["createdBy"] = req.user.name

    // new category
    const newCategory = new CategoryModel(createCategoryInput)
    await newCategory.save()
    res.status(200).json({"success":true, "message": "Category is created successfully", category: newCategory})
})


export const categoryGetAllController = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next:NextFunction): Promise<void> => {
    const categories = await getData(req, CategoryModel, 'name')
    res.status(200).json({"success":true, categories})
})


export const categoryGetOneController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const category = await findIdCategory(id, next)
    if (category){
        res.status(200).json({"success": true, category})
    }
})

export const categoryGetSubCatController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const category = await CategoryModel.findById(id, {__v:0})
                    .populate({
                        path: "subCategories",
                        select: "-id ",
                        match: {finalPrice: {$ne: null}}
                    })
    if (!category) return next( new ErrorHandler('Category does not exist', 404))
    if (category){
        res.status(200).json({"success": true, category})
    }
})

export const categoryUpdateController = asyncErrors( async(req:updateCategoryAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const category = await findIdCategory(id, next)
    if (category){
        const updateCategoryInput: UpdateCategoryInterface = {...req.body}
        // if category name is updated
        if (updateCategoryInput.name){

            // changes in subCategories, changes in rating
            await updateSubCategoryRating(SubCategoryModel ,category.name, updateCategoryInput.name, next)
            await updateSubCategoryRating(RatingModel ,category.name, updateCategoryInput.name, next)

            // changes in cart, changes in order
            await updateCartOrder(CartModel, category.name, updateCategoryInput.name, next)
            await updateCartOrder(OrderModel, category.name, updateCategoryInput.name, next)
            
        }
        updateCategoryInput["updatedBy"] = req.user.name
        updateCategoryInput["updatedAt"] = new Date()
        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, updateCategoryInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": "Category has been updated successfully", category: updatedCategory})
    }
})


export const categoryDeleteController = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const id = req.params.id
    const category = await findIdCategory(id, next)
    if (category){
        if (category.subCategories) return next(new ErrorHandler('Categrory can not be deleted while having sub categories', 400))
        await CategoryModel.findByIdAndDelete(id)
        res.status(200).json({"success": true, "message": "Category has been deleted successfully"})
    }
})

// CSV export
export const exportDataCategory = asyncErrors( async (req:Request<{},{},GetDataInterface>, res:Response, next: NextFunction)  => {
    return await exportData(req, res, next, categoryFields, CategoryModel, 'name', 'categories')
})

// export const categoryUploadImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
//     const id = req.params.id
//     const category = await findIdCategory(id, next)
//     if (category) {
//         const filenames = req.files.map((file: Express.Multer.File) => file.filename);
//         for (const filename of filenames){
//             if (category.images?.indexOf(filename) === -1) category.images?.push(filename)
//         }
//         await category.save();
//         res.status(200).json({ success: true, message: 'Images uploaded successfully'});
//     }
// })

// export const categoryRemoveImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
//     const id = req.params.id
//     const category = await findIdCategory(id, next)
//     if (category) {
//         const filename: string = req.body.filename || '';
//         category.images = category.images?.filter(name => name !== filename)
//         await category.save();

//         // check if other category has the same image
//         const categories = await CategoryModel.find({images: filename})
//         if (categories.length === 0){
//             const imagePath = path.join(__dirname, '../../uploads/category', filename)
//             if (fs.existsSync(imagePath)) {
//                 fs.unlinkSync(imagePath)
//             }
//         }
//         res.status(200).json({ success: true, message: 'Image removed successfully'});
//     }
// })

// export const categoryViewImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
//     const id = req.params.id
//     const category = await findIdCategory(id, next)
//     if (category) {
//         if (category.images!.length === 0) return res.status(404).json({ success: false, message: 'No images found for this category' });

//         // Generate array of image URLs
//         const imageUrls: string[] = [];
//         for (const filename of category.images!) {
//             const imageUrl = `/uploads/category/${filename}`; 
//             imageUrls.push(imageUrl);
//         }

//         // Send the image URLs as response
//         console.log(imageUrls);
//         return res.status(200).json({ success: true, images: imageUrls[0] });
//     }
// })

