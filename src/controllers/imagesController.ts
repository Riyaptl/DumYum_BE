import { Request, Response, NextFunction } from "express";
import { asyncErrors } from "../middlewares/catchAsyncErrors";
import { findIdSpecial } from "./specialController";
import { findIdCategory } from "./categoryController";
import { findIdSubCat } from "./subCategoryController";
import fs from 'fs'
import { ErrorHandler } from "../utils/errorHandler";
import { SubCategoryModel } from "../models/subCategoryModel";
import path from "path";
import { CategoryModel } from "../models/categoryModel";
import { SpecialModel } from "../models/specialModel";

const getData = async (page: string, id: string, next: NextFunction) => {
    try {
        let data
        switch (page) {
            case "special":
                data = await findIdSpecial(id, next)
                break;
            case "category":
                data = await findIdCategory(id, next)
                break;
            case "subCategory":
                data = await findIdSubCat(id, next)
                break;
            default:
                break;
        }
        return data
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

const setImagePath = async (page: string, filename: string, imageType: string, next: NextFunction) => {
    try {
        let query: {[key: string]: string} = {}
        if (imageType === "smallImages") {
            query["smallImages"] = filename
        }else {
            query["images"] = filename
        }

        let imagePath = ''
        
        switch (page) {
            case "special":
                const special = await SpecialModel.find(query)
                if (special.length === 0) imagePath = path.join(__dirname, '../../uploads/special', filename)
                break;
            case "category":
                const category = await CategoryModel.find(query)
                if (category.length === 0) imagePath = path.join(__dirname, '../../uploads/category', filename)
                break;
            case "subCategory":
                const subCat = await SubCategoryModel.find(query)
                if (subCat.length === 0) imagePath = path.join(__dirname, '../../uploads/subCategory', filename)
                break;
            default:
                break;
        }
        return imagePath
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500))
    }
}

export const uploadImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const page = req.query.page
    const data = await getData(page, id, next)
    // console.log(req);
    if (data) {
        const filenames = req.files.map((file: Express.Multer.File) => file.filename);
        if (req.query.size === 'large'){
            for (const filename of filenames){
                if (data.images?.indexOf(filename) === -1) data.images?.push(filename)
            }
        }else if (req.query.size === 'small'){
            for (const filename of filenames){
                if (data.smallImages?.indexOf(filename) === -1) data.smallImages?.push(filename)
            }
        }
        await data.save();
        res.status(200).json({ success: true, message: 'Images uploaded successfully'});
    }
})

export const updateImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const page = req.query.page
    const data = await getData(page, id, next)
    if (data) {
        const filenames = req.files.map((file: Express.Multer.File) => file.filename);
        if (req.query.size === 'large'){
            data.images = filenames
        }else if (req.query.size === 'small'){
            data.smallImages = filenames
        }
        await data.save();
        res.status(200).json({ success: true, message: 'Images updated successfully'});
    }
})

export const removeImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const page = req.query.page
    const data = await getData(page, id, next)
    if (data) {
        let imagePath = ''
        const filename: string = req.body.filename || '';
        if (req.query.size === 'large'){
            data.images = data.images?.filter(name => name !== filename)
            await data.save();
            const path = await setImagePath(page, filename, "images", next) 
            if (path) imagePath = path
        }else if (req.query.size === 'small'){
            data.smallImages = data.smallImages?.filter(name => name !== filename)
            await data.save();
            const path = await setImagePath(page, filename, "smallImages", next) 
            if (path) imagePath = path
        }
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
        }
        res.status(200).json({ success: true, message: 'Image removed successfully'});
    }
})

export const viewImagesController = asyncErrors( async (req:any, res:Response, next: NextFunction)  => {
    const id = req.params.id
    const page = req.query.page
    const data = await getData(page, id, next)
    if (data) {
        if (req.query.size === 'large' && data.images!.length === 0)  res.status(404).json({ success: false, message: 'No images found for this category' });
        if (req.query.size === 'small' && data.smallImages!.length === 0)  res.status(404).json({ success: false, message: 'No images found for this category' });

        // Generate array of image URLs
        const imageUrls: string[] = [];
        for (const filename of data.images!) {
            const imageUrl = `/uploads/${page}/${filename}`; 
            imageUrls.push(imageUrl);
        }
        const smallImageUrls: string[] = [];
        for (const filename of data.smallImages!) {
            const smallImageUrl = `/uploads/${page}/${filename}`; 
            smallImageUrls.push(smallImageUrl);
        }

        // Send the image URLs as response
        res.status(200).json({ success: true, images: imageUrls, smallImages: smallImageUrls });
    }
})