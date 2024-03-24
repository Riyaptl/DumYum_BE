import { NextFunction, Request, Response } from "express"
import { asyncErrors } from "../middlewares/catchAsyncErrors"
import { CreateIngredientInterface, UpdateIngredientInterface } from "../interfaces/ingredientsInterface"
import { priceCalculation, validEntry } from "./subCategoryController"
import { BoxModel, ChocolateModel, DryFruitModel, FlavourModel, RecipeModel } from "../models/ingredientModel"
import { ErrorHandler } from "../utils/errorHandler"
import { commonIngredientFileds } from "../headers"
const {Parser} = require("json2csv")

interface createIngredientAuthenticatedInterface extends Request {
    user: {name?: string}
    body: CreateIngredientInterface
}

interface updateIngredientAuthenticatedInterface extends Request {
    user: {name?: string}
    body: UpdateIngredientInterface
}

// For internal use
const findItem = async (entry: string, id: string, next: NextFunction) => {
    try {
        let item
        switch (entry) {
            case 'Chocolate':
                item = await ChocolateModel.findById(id)
                break;
            case 'Recipe':
                item = await RecipeModel.findById(id)
                break;
            case 'DryFruit':
                item = await DryFruitModel.findById(id) 
                break;
            case 'Flavour':
                item = await FlavourModel.findById(id)
                break;
            case 'Box':
                item = await BoxModel.findById(id)
                break;
            default:
                break;
        }
        if (!item) return next(new ErrorHandler('Required item not found', 400))
        return item
    } catch (error) {
        
    }
}

const decideModel = (entry: string, next: NextFunction): any => {
    try {
        // based on entry decide model
        let model: any
        switch (entry) {
            case 'Chocolate':
                model = ChocolateModel
                break;
            case 'Recipe':
                model = RecipeModel
                break;
            case 'DryFruit':
                model = DryFruitModel
                break;
            case 'Flavour':
                model = FlavourModel
                break;
            case 'Box':
                model = BoxModel
                break;
            default:
                break;
        }
        if (!model) return next(new ErrorHandler('Invalid Entry', 400))
        return model
    } catch (error) {
        return next(new ErrorHandler('Internal server error', 500))
    }
}

export const ingredientCreateController = asyncErrors( async(req:createIngredientAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    
    // take out entry
    let {entry, ...createIngredientInput} = req.body
    
    const {sellingPrice, gst, ...other} = createIngredientInput

    // validate gst value
    if (gst && !validEntry(gst, next)) return next( new ErrorHandler('Invalid GST entry', 400))
    
    // add price calculations
    if (sellingPrice){
        priceCalculation(createIngredientInput, sellingPrice, null, gst, next)
    }
    
    const model = decideModel(entry, next) || ChocolateModel
                            
    // add createdBy
    createIngredientInput["createdBy"] = req.user.name
    
    // create in respective model
    const newIngredient = new model(createIngredientInput)
    await newIngredient.save()
    
    res.status(200).json({"success": true, "message": `${entry} is created successfully`})
})

export const ingredientGetAllController  = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    
    const chocolates = await ChocolateModel.find()
    const recipes = await RecipeModel.find()
    const dryFruits = await DryFruitModel.find()
    const flavours = await FlavourModel.find()
    const boxes = await BoxModel.find()

    let ingredients = {chocolates, recipes, dryFruits, flavours, boxes}

    res.status(200).json({"success": true, ingredients})
})

export const ingredientGetEachController  = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    
    const entry = req.body.entry
    const id = req.params.id
    const item = await findItem(entry, id, next)
    if (item){
        res.status(200).json({"success": true, item})
    }
})

export const ingredientDeleteEachController  = asyncErrors( async(req:updateIngredientAuthenticatedInterface, res:Response, next:NextFunction): Promise<void> => {
    
    const {entry, ...updateIngredientInput} = req.body
    const id = req.params.id
    const item = await findItem(entry, id, next)
    if (item){
        const model = decideModel(entry, next)
        let {sellingPrice, gst, ...other} = updateIngredientInput
        // validate gst value
        if (gst && !validEntry(gst, next)) return next( new ErrorHandler('Invalid GST entry', 400))

        // add price calculations
        if (!sellingPrice) {sellingPrice = item.sellingPrice || undefined}
        if (sellingPrice){
            if (!gst) gst = item.gst || undefined
            priceCalculation(updateIngredientInput, sellingPrice, null, gst, next)
        }
        // make changes in products in CART
    
        // add updatedBy
        updateIngredientInput["updatedBy"] = req.user.name
        updateIngredientInput["updatedAt"] = new Date()
        await model.findByIdAndUpdate(id, updateIngredientInput, {new: true, projection: {__v:0}})
        res.status(200).json({"success": true, "message": `${entry} has been updated successfully`})
    }
})

export const exportDataIngredients = asyncErrors( async (req:Request, res:Response, next: NextFunction)  => {
    
   
    // loop through 5 ingredients
    const entries = ['Chocolates','Recipes','DryFruits','Flavours','Boxes']
    const models: Array<any> = [ChocolateModel, RecipeModel, DryFruitModel, FlavourModel, BoxModel]
    const fields = commonIngredientFileds
    const parser = new Parser({
        fields
    })
    const json: Array<Object> = []
    for (let ind = 0; ind < entries.length; ind++) {

        // set title
        const title:any = {Name: entries[ind]}
        for (let index = 1; index < fields.length; index++){title[fields[index]] = null }
        json.push(title)
        
        // fill rest of the data
        const data = await models[ind].find()
        for (const singleData of data as Array<{[key: string]: any}>) {
            let singleDataObj: any = {}
            for (let index = 0; index < fields.length; index++) {
                singleDataObj[fields[index]] = singleData[fields[index][0].toLowerCase()+fields[index].substring(1)] || null          
            }
            json.push({...singleDataObj})
        }
    }
    const csv = parser.parse(json)
    res.header('Content-Type', 'text/csv')
    res.attachment('ingredients.csv')
    return res.send(csv)
    
})

export const ingredientGetIndividualController  = asyncErrors( async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    
    const entry = req.body.entry
    const model = decideModel(entry, next)
    const data = await model.find()
    res.status(200).json({"success": true, data})
})

